class CurrencyConverter {
    constructor(apiUrl) {
      this.apiUrl = apiUrl;
      this.conversionRates = {};
    }
  
    async fetchConversionRates() {
      try {
        const response = await fetch(this.apiUrl);
        const data = await response.json();
        if (data && data.conversion_rates) {
          this.conversionRates = data.conversion_rates;
          return this.conversionRates;
        } else {
          throw new Error('Unexpected response format.');
        }
      } catch (err) {
        console.error('Error fetching conversion rates:', err);
      }
    }
  
    calculateConversion(fromCurrency, toCurrency, amount) {
      if (!this.conversionRates[fromCurrency] || !this.conversionRates[toCurrency]) {
        throw new Error('Invalid currencies selected.');
      }
     
      const rateFrom = this.conversionRates[fromCurrency];
      const rateTo = this.conversionRates[toCurrency];
      const conversionRate = rateTo / rateFrom;
      return {
        conversionRate: conversionRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        convertedAmount: (amount * conversionRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        }}
  }
  
  class UIController {
    constructor(converter, widget) {
      this.converter = converter;
      this.widget = widget;
  
      
      this.currencyList = document.getElementById('currency-list');
      this.currencyList2 = document.getElementById('currency-list2');
      this.currencySelect = document.getElementById('currency-pair');
      this.currencySelect2 = document.getElementById('currency-pair2');
      this.currencyOutput = document.getElementById('currency-rate');
      this.amountInput = document.getElementById('amount');
      this.convertButton = document.getElementById('convert-btn');
      this.swapContainer = document.getElementById('swap-container');
  
      
      this.convertButton.addEventListener('click', () => this.handleConvert());
      this.swapContainer.addEventListener('click', () => this.handleSwap());
      this.currencySelect.addEventListener('change', () => this.handleConvert());
      this.currencySelect2.addEventListener('change', () => this.handleConvert());
    }
  
    async init() {
      try {
        const conversionRates = await this.converter.fetchConversionRates();
        this.populateDatalist(conversionRates, this.currencyList);
        this.populateDatalist(conversionRates, this.currencyList2);

        
        const defaultFromCurrency = 'EUR';
        const defaultToCurrency = 'USD';

        
        const defaultTradingPair = `FX:${defaultFromCurrency}${defaultToCurrency}`;
        this.widget.updateTradingViewWidget(defaultTradingPair);

          
       
        
        this.currencySelect.value = defaultFromCurrency;
        this.currencySelect2.value = defaultToCurrency;
      } catch (err) {
        console.error('Error initializing UI:', err);
      }
    }
  
    populateDatalist(conversionRates, datalist) {
      datalist.innerHTML = '';
      for (const currency in conversionRates) {
        const option = document.createElement('option');
        option.value = currency;
        datalist.appendChild(option);
      }
    }
  
    handleConvert() {
      try {
        const fromCurrency = this.currencySelect.value;
        const toCurrency = this.currencySelect2.value;
        const amount = parseFloat(this.amountInput.value);
  
        if (!isNaN(amount) && amount > 0) {
          const { conversionRate, convertedAmount } = this.converter.calculateConversion(fromCurrency, toCurrency, amount);
  
          const currencySymbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            AUD: 'A$',
            CAD: ' Can$',
            PHP: '₱',
            TRY: '₺',
            CAD: '$',
            CHF: 'CHF',
            CNY: '¥',
            INR: '₹',
            RUB: '₽',
            BRL: 'R$',
            ZAR: 'R',
            MXN: '$',
            SGD: '$',
            NZD: '$',
            HKD: 'HK$',
            NGN: '₦',
            
          };
          const fromSymbol = currencySymbols[fromCurrency] || fromCurrency;
          const toSymbol = currencySymbols[toCurrency] || toCurrency;
  
          this.currencyOutput.innerHTML= `<div class=currency-output>${fromSymbol}${amount} is ${toSymbol}${convertedAmount}</div>
          <div class="currency_rate1">
          <span>1 ${fromCurrency} = ${conversionRate} ${toCurrency}</span><br>
          </div><div class="currency_rate2"><span>1 ${toCurrency} = ${(1 / conversionRate).toFixed(2)} ${fromCurrency}</span></div>`
          ;
  
          const tradingPair = `FX:${fromCurrency}${toCurrency}`;
          this.widget.updateTradingViewWidget(tradingPair);
        } else {
          this.currencyOutput.textContent = 'Enter an amount and convert to your selected currency';
        }
      } catch (err) {
        console.error('Error converting currencies:', err);
      }
    }
  
    handleSwap() {
      try {
        const temp = this.currencySelect.value;
        this.currencySelect.value = this.currencySelect2.value;
        this.currencySelect2.value = temp;
        this.handleConvert();
      } catch (err) {
        console.error('Error swapping currencies:', err);
      }
    }
  }
  
  class TradingViewWidget {
    updateTradingViewWidget(symbol) {
      const container = document.getElementById('tradingview-widget-container');
      container.innerHTML = '';
  
      const widgetScript = document.createElement('script');
      widgetScript.type = 'text/javascript';
      widgetScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      widgetScript.async = true;
  
      const widgetConfig = {
        symbol: symbol,
        width: '100%',
        height: '180%',
        locale: 'en',
        dateRange: '1D',
        colorTheme: 'light',
        isTransparent: false,
        style: '2',         
        hideSideToolbar: false, 
        "hide_top_toolbar": true, 
        "details": true,
        studies: [],             
        autosize: true,
        "hide_volume": true,
        largeChartUrl: '',
      };
  
      widgetScript.innerHTML = JSON.stringify(widgetConfig);
      container.appendChild(widgetScript);
    }
  }
  
  
  const apiURL = 'https://v6.exchangerate-api.com/v6/96cbd65941bda3beade8ac13/latest/USD';
  const converter = new CurrencyConverter(apiURL);
  const widget = new TradingViewWidget();
  const uiController = new UIController(converter, widget);
  
  uiController.init();
  

