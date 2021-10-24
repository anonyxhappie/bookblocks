App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  books: [],
  userRatings: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = window.ethereum;
      web3 = new Web3(App.web3Provider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = window.ethereum;
      web3 = new Web3(window.ethereum || "ws://127.0.0.1:7545");
    }
    window.ethereum.request({ method: 'eth_requestAccounts' }).then((accounts) => {
      console.log('accounts:-:', accounts)
    })
    return App.initContract();
  },

  initContract: function() {
    console.log('in initContract');
    $.getJSON("BookReview.json", function(bookReview) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.BookReview = TruffleContract(bookReview);
      // Connect provider to interact with contract
      App.contracts.BookReview.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    console.log('in listenForEvents');
    App.contracts.BookReview.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.ratingEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        // console.log("event triggered", event, event.event)
        // App.render();
        // window.location.reload();
      });
    });
  },

  render: function() {
    console.log('in render');

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      console.log('in getCoinbase', err, account);

      if (err === null) {
        App.account = account;
        web3.eth.defaultAccount = account || web3.eth.accounts[0];
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    App.getBooks();
  },

  renderBooks: async function() {
    console.log('in renderBooks');
    let availableBooks = $("#availableBooks");
    availableBooks.empty();

    let booksSelect = $('#booksSelect');
    booksSelect.empty();
    for (let i = 1; i <= App.books.length; i++) {
      let bookTemplate = "<tr><th>" + App.books[i].id + "</th><td>" + App.books[i].name + "</td><td>" + App.books[i].ratingsCount + "</td></tr>"
      availableBooks.append(bookTemplate);

      let bookOption = "<option value='" + App.books[i].id + "' >" + App.books[i].name + "</ option>"
      booksSelect.append(bookOption);
    }

  },

  getBooks: async function() {
    console.log('in getBooks');
    const instance = await App.contracts.BookReview.deployed(); 
    const bookAdded = await instance.addBook('My Book');
    const booksCount = await instance.booksCount();

    console.log('instance', instance, bookAdded);
    
    console.log('booksCount', booksCount);
    for (let i = 1; i <= booksCount.c[0]; i++) {
      let book = await instance.books(i);
      let id = book[0].c[0];
      let name = book[1];
      let ratingsCount = book[2].c[0];
      
      const index = await App.books.findIndex(book => book.id==id); 
      if (index === -1) await App.books.push(...App.books, {id, name, ratingsCount});
    }

    console.log('books', App.books)
    await App.renderBooks();
    
    for (let i = 1; i <= App.books.length; i++) {
      let userRating = await instance.bookRatings(App.books[i].id);
      console.log('userRating', userRating)
      App.userRatings[books[i].id] = userRating;
    }


  },

  rateBook: function() {
    console.log('in rateBook');

    var bookId = $('#booksSelect').val();
    var rating = $('#ratingSelect').val();
    var comment = $('#commentArea').val();
    App.contracts.BookReview.deployed().then(function(instance) {
      return instance.rate(bookId, comment, parseInt(rating), { from: App.account });
    }).then(function(result) {
      console.log('result', result);
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
