// AutoVault Protocol JavaScript
class AutoVault {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.initializeCharts();
    this.startRealTimeUpdates();
  }

  init() {
    console.log('🏦 AutoVault Protocol Initialized');
    this.loadUserData();
    this.updatePortfolioMetrics();
  }

  setupEventListeners() {
    // Navigation
    this.setupNavigation();
    
    // Deposit functionality
    this.setupDepositForm();
    
    // Risk profile selection
    this.setupRiskSelector();
    
    // Governance voting
    this.setupGovernanceActions();
    
    // Analytics period selection
    this.setupAnalyticsPeriods();
    
    // Claim rewards
    this.setupRewardsActions();
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Get target section
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
          link.classList.add('active');
        }
      });
    });
  }

  setupDepositForm() {
    const depositBtn = document.querySelector('.deposit-btn');
    const depositAmount = document.getElementById('depositAmount');
    const assetSelect = document.getElementById('assetSelect');
    const maxBtn = document.querySelector('.input-max');

    if (maxBtn) {
      maxBtn.addEventListener('click', () => {
        const selectedAsset = assetSelect.value;
        const maxAmounts = {
          massa: '1234.56',
          usdc: '5000.00',
          usdt: '4800.00',
          eth: '2.5'
        };
        depositAmount.value = maxAmounts[selectedAsset] || '0';
      });
    }

    if (depositBtn) {
      depositBtn.addEventListener('click', () => {
        const amount = depositAmount.value;
        const asset = assetSelect.value;
        const riskProfile = document.querySelector('.risk-btn.active')?.dataset.risk;

        if (!amount || parseFloat(amount) <= 0) {
          this.showNotification('Please enter a valid amount', 'error');
          return;
        }

        this.processDeposit(amount, asset, riskProfile);
      });
    }
  }

  setupRiskSelector() {
    const riskButtons = document.querySelectorAll('.risk-btn');
    
    riskButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        riskButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update strategy recommendations based on risk profile
        this.updateStrategyRecommendations(btn.dataset.risk);
      });
    });
  }

  setupGovernanceActions() {
    const voteButtons = document.querySelectorAll('.proposal-actions .btn');
    
    voteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const isVoteFor = btn.classList.contains('btn-success');
        const proposalCard = btn.closest('.proposal-card');
        const proposalTitle = proposalCard.querySelector('.proposal-title').textContent;
        
        this.castVote(proposalTitle, isVoteFor);
      });
    });
  }

  setupAnalyticsPeriods() {
    const periodButtons = document.querySelectorAll('.period-btn');
    
    periodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const container = btn.closest('.analytics-header');
        const buttons = container.querySelectorAll('.period-btn');
        
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update chart data based on selected period
        this.updateChartData(btn.textContent);
      });
    });
  }

  setupRewardsActions() {
    const claimBtn = document.querySelector('.claim-btn');
    
    if (claimBtn) {
      claimBtn.addEventListener('click', () => {
        this.claimRewards();
      });
    }
  }

  processDeposit(amount, asset, riskProfile) {
    this.showLoading('Processing deposit...');
    
    // Simulate transaction processing
    setTimeout(() => {
      this.hideLoading();
      this.showNotification(`Successfully deposited ${amount} ${asset.toUpperCase()}`, 'success');
      
      // Update portfolio data
      this.updatePortfolioAfterDeposit(amount, asset, riskProfile);
      
      // Clear form
      document.getElementById('depositAmount').value = '';
    }, 2000);
  }

  updatePortfolioAfterDeposit(amount, asset, riskProfile) {
    // Simulate portfolio update
    const portfolioAmount = document.querySelector('.portfolio-amount');
    const currentValue = parseFloat(portfolioAmount.textContent.replace('$', '').replace(',', ''));
    const newValue = currentValue + (parseFloat(amount) * this.getAssetPrice(asset));
    
    portfolioAmount.textContent = `$${newValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Update allocation chart
    this.updateAllocationChart();
    
    // Add new strategy to active strategies
    this.addActiveStrategy(asset, riskProfile);
  }

  getAssetPrice(asset) {
    const prices = {
      massa: 3.45,
      usdc: 1.00,
      usdt: 1.00,
      eth: 2400.00
    };
    return prices[asset] || 1;
  }

  addActiveStrategy(asset, riskProfile) {
    const strategiesList = document.querySelector('.strategy-list');
    const strategies = {
      conservative: { apy: '8-12%', protocol: 'MassaLend' },
      balanced: { apy: '12-18%', protocol: 'MassaDEX' },
      aggressive: { apy: '20-35%', protocol: 'MassaFarm' }
    };
    
    const strategy = strategies[riskProfile];
    const newStrategy = document.createElement('div');
    newStrategy.className = 'strategy-item';
    newStrategy.innerHTML = `
      <div class="strategy-info">
        <div class="strategy-name">${asset.toUpperCase()} Strategy</div>
        <div class="strategy-protocol">${strategy.protocol}</div>
      </div>
      <div class="strategy-metrics">
        <div class="strategy-apy">${strategy.apy} APY</div>
        <div class="strategy-allocation">Active</div>
      </div>
    `;
    
    strategiesList.appendChild(newStrategy);
  }

  castVote(proposalTitle, isVoteFor) {
    this.showLoading('Casting vote...');
    
    setTimeout(() => {
      this.hideLoading();
      const voteType = isVoteFor ? 'FOR' : 'AGAINST';
      this.showNotification(`Vote cast ${voteType} proposal: ${proposalTitle}`, 'success');
      
      // Update vote percentages (simulate)
      this.updateVotePercentages();
    }, 1500);
  }

  updateVotePercentages() {
    const voteBars = document.querySelectorAll('.vote-for');
    voteBars.forEach(bar => {
      const currentWidth = parseInt(bar.style.width);
      const newWidth = Math.min(currentWidth + Math.random() * 2, 95);
      bar.style.width = `${newWidth}%`;
    });
  }

  claimRewards() {
    this.showLoading('Claiming rewards...');
    
    setTimeout(() => {
      this.hideLoading();
      this.showNotification('Rewards claimed successfully!', 'success');
      
      // Reset reward amounts
      const rewardAmounts = document.querySelectorAll('.reward-amount');
      rewardAmounts.forEach(amount => {
        amount.textContent = '0.00';
      });
      
      const rewardValues = document.querySelectorAll('.reward-value');
      rewardValues.forEach(value => {
        value.textContent = '$0.00';
      });
    }, 1500);
  }

  updateStrategyRecommendations(riskProfile) {
    const recommendations = {
      conservative: {
        primary: 'MASSA Staking',
        secondary: 'USDC Lending',
        allocation: '70% Staking, 30% Lending'
      },
      balanced: {
        primary: 'MASSA-USDC LP',
        secondary: 'Mixed Strategies',
        allocation: '50% LP, 30% Lending, 20% Staking'
      },
      aggressive: {
        primary: 'High-Yield Farming',
        secondary: 'Volatile Pairs',
        allocation: '60% Farming, 25% LP, 15% Lending'
      }
    };
    
    console.log(`Updated recommendations for ${riskProfile} profile:`, recommendations[riskProfile]);
  }

  initializeCharts() {
    this.createAllocationChart();
    this.createAnalyticsCharts();
  }

  createAllocationChart() {
    const canvas = document.getElementById('allocationChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    
    // Data for the pie chart
    const data = [
      { label: 'Liquidity Pools', value: 45, color: '#6366f1' },
      { label: 'Lending', value: 30, color: '#10b981' },
      { label: 'Staking', value: 25, color: '#f59e0b' }
    ];
    
    let currentAngle = -Math.PI / 2;
    
    data.forEach(segment => {
      const sliceAngle = (segment.value / 100) * 2 * Math.PI;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      
      currentAngle += sliceAngle;
    });
    
    // Draw center circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  createAnalyticsCharts() {
    const charts = ['tvlChart', 'apyChart', 'usersChart'];
    
    charts.forEach(chartId => {
      const canvas = document.getElementById(chartId);
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      this.drawLineChart(ctx, canvas.width, canvas.height);
    });
  }

  drawLineChart(ctx, width, height) {
    const padding = 20;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Generate sample data
    const dataPoints = [];
    for (let i = 0; i < 30; i++) {
      dataPoints.push({
        x: padding + (i * chartWidth / 29),
        y: padding + Math.random() * chartHeight
      });
    }
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(dataPoints[0].x, dataPoints[0].y);
    
    for (let i = 1; i < dataPoints.length; i++) {
      ctx.lineTo(dataPoints[i].x, dataPoints[i].y);
    }
    
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw points
    dataPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
    });
  }

  updateAllocationChart() {
    // Redraw allocation chart with new data
    this.createAllocationChart();
  }

  updateChartData(period) {
    console.log(`Updating chart data for period: ${period}`);
    // Simulate chart data update
    this.createAnalyticsCharts();
  }

  loadUserData() {
    // Simulate loading user data
    const userData = {
      portfolioValue: 12456.78,
      totalDeposited: 10000.00,
      totalEarned: 2456.78,
      activeStrategies: 3,
      vaultTokens: 156.78
    };
    
    console.log('User data loaded:', userData);
  }

  updatePortfolioMetrics() {
    // Simulate real-time portfolio updates
    setInterval(() => {
      const portfolioAmount = document.querySelector('.portfolio-amount');
      const portfolioChange = document.querySelector('.portfolio-change');
      
      if (portfolioAmount && portfolioChange) {
        const currentValue = parseFloat(portfolioAmount.textContent.replace('$', '').replace(',', ''));
        const changePercent = (Math.random() - 0.5) * 2; // Random change between -1% and 1%
        const newValue = currentValue * (1 + changePercent / 100);
        
        portfolioAmount.textContent = `$${newValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        const changeClass = changePercent >= 0 ? 'positive' : 'negative';
        const changeSymbol = changePercent >= 0 ? '+' : '';
        portfolioChange.className = `portfolio-change ${changeClass}`;
        portfolioChange.textContent = `${changeSymbol}${changePercent.toFixed(1)}% (24h)`;
      }
    }, 10000); // Update every 10 seconds
  }

  startRealTimeUpdates() {
    // Update APY values
    setInterval(() => {
      const apyElements = document.querySelectorAll('.strategy-apy');
      apyElements.forEach(element => {
        const currentAPY = parseFloat(element.textContent);
        const variation = (Math.random() - 0.5) * 0.5; // ±0.25% variation
        const newAPY = Math.max(0, currentAPY + variation);
        element.textContent = `${newAPY.toFixed(1)}% APY`;
      });
    }, 15000); // Update every 15 seconds

    // Update TVL and other metrics
    setInterval(() => {
      this.updateProtocolMetrics();
    }, 20000); // Update every 20 seconds
  }

  updateProtocolMetrics() {
    const metrics = document.querySelectorAll('.stat-value, .gov-stat-value, .analytics-value');
    metrics.forEach(metric => {
      const text = metric.textContent;
      if (text.includes('$') || text.includes('%')) {
        const value = parseFloat(text.replace(/[$,%]/g, ''));
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const newValue = value * (1 + variation);
        
        if (text.includes('$')) {
          if (newValue >= 1000000) {
            metric.textContent = `$${(newValue / 1000000).toFixed(1)}M`;
          } else if (newValue >= 1000) {
            metric.textContent = `$${(newValue / 1000).toFixed(0)}K`;
          } else {
            metric.textContent = `$${newValue.toFixed(2)}`;
          }
        } else if (text.includes('%')) {
          metric.textContent = `${newValue.toFixed(1)}%`;
        }
      }
    });
  }

  showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.querySelector('.loading-text');
    
    if (overlay && loadingText) {
      loadingText.textContent = message;
      overlay.classList.add('active');
    }
  }

  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 1001;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }
}

// Initialize AutoVault when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AutoVault();
});

// Add some utility functions for demo purposes
window.AutoVaultDemo = {
  simulateRebalance() {
    console.log('🔄 Simulating portfolio rebalance...');
    const strategies = document.querySelectorAll('.strategy-item');
    strategies.forEach(strategy => {
      const allocation = strategy.querySelector('.strategy-allocation');
      if (allocation && allocation.textContent.includes('$')) {
        const currentValue = parseFloat(allocation.textContent.replace('$', '').replace(',', ''));
        const newValue = currentValue * (1 + (Math.random() - 0.5) * 0.1);
        allocation.textContent = `$${newValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
      }
    });
  },

  simulateMarketChange() {
    console.log('📈 Simulating market conditions change...');
    const apyElements = document.querySelectorAll('.strategy-apy');
    apyElements.forEach(element => {
      const currentAPY = parseFloat(element.textContent);
      const marketImpact = (Math.random() - 0.5) * 5; // ±2.5% market impact
      const newAPY = Math.max(0, currentAPY + marketImpact);
      element.textContent = `${newAPY.toFixed(1)}% APY`;
    });
  },

  addNewStrategy() {
    console.log('➕ Adding new strategy...');
    const strategiesList = document.querySelector('.strategy-list');
    const newStrategy = document.createElement('div');
    newStrategy.className = 'strategy-item';
    newStrategy.innerHTML = `
      <div class="strategy-info">
        <div class="strategy-name">New Yield Farm</div>
        <div class="strategy-protocol">MassaFarm</div>
      </div>
      <div class="strategy-metrics">
        <div class="strategy-apy">32.5% APY</div>
        <div class="strategy-allocation">$0</div>
      </div>
    `;
    strategiesList.appendChild(newStrategy);
  }
};

// Console welcome message
console.log(`
🏦 AutoVault Protocol Demo
========================
Welcome to the AutoVault prototype! 

Try these demo functions in the console:
- AutoVaultDemo.simulateRebalance()
- AutoVaultDemo.simulateMarketChange()
- AutoVaultDemo.addNewStrategy()

The app includes:
✅ Dynamic yield optimization
✅ Risk profile management
✅ Real-time portfolio tracking
✅ Governance voting system
✅ Analytics dashboard
✅ Responsive design
`);