App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("RTokenSale.json", function(RTokenSale) {
      App.contracts.RTokenSale = TruffleContract(RTokenSale);
      App.contracts.RTokenSale.setProvider(App.web3Provider);
      App.contracts.RTokenSale.deployed().then(function(RTokenSale) {
        console.log("RToken Sale Address:", RTokenSale.address);
      });
    }).done(function() {
      $.getJSON("RToken.json", function(RToken) {
        App.contracts.RToken = TruffleContract(RToken);
        App.contracts.RToken.setProvider(App.web3Provider);
        App.contracts.RToken.deployed().then(function(RToken) {
          console.log("RToken Address:", RToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.RTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) { //solves double loading problem
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

    // Load token sale contract
    App.contracts.RTokenSale.deployed().then(function(instance) {
      RTokenSaleInstance = instance;
      return RTokenSaleInstance.tokenPrice(); //price of a Rcoin
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber()); //shown on webpage. Convert it from Wei to ether
      return RTokenSaleInstance.tokensSold(); // so that client will understand. Wei is used to transfer amount.
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold); // 0/750000 tokenssold.
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%'); //takes care of the loader

      // Load token contract
      App.contracts.RToken.deployed().then(function(instance) {
        RTokenInstance = instance;
        return RTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.RToken-balance').html(balance.toNumber()); //updating balance
        App.loading = false; //after loading is done
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.RTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice, //this is in Wei
        gas: 500000 // Gas limit. default
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
