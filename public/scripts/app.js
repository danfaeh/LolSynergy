angular
  .module('LolSynergy', [
    'ui.router',
    'satellizer'
  ])
  .controller('MainController', MainController)
  .controller('HomeController', HomeController)
  .controller('CompsController', CompsController)
  .controller('ResultsController', ResultsController)
  .controller('LoginController', LoginController)
  .controller('SignupController', SignupController)
  .controller('LogoutController', LogoutController)
  .controller('ProfileController', ProfileController)
  .service('Account', Account)
  .config(configRoutes)
  ;

////////////
// ROUTES //
////////////

configRoutes.$inject = ["$stateProvider", "$urlRouterProvider", "$locationProvider"]; // minification protection
function configRoutes($stateProvider, $urlRouterProvider, $locationProvider) {

  //this allows us to use routes without hash params!
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

  // for any unmatched URL redirect to /
  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'templates/home.html',
      controller: 'HomeController',
      controllerAs: 'champs'
    })
    .state('comps', {
      url: '/comps',
      templateUrl: 'templates/comps.html',
      controller: 'CompsController',
      controllerAs: 'comps'
    })
    .state('results', {
      url: '/results',
      templateUrl: 'templates/results.html',
      controller: 'HomeController',
      controllerAs: 'champs'
    })       
    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: 'SignupController',
      controllerAs: 'sc',
      resolve: {
        skipIfLoggedIn: skipIfLoggedIn
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginController',
      controllerAs: 'lc',
      resolve: {
        skipIfLoggedIn: skipIfLoggedIn
      }
    })
    .state('logout', {
      url: '/logout',
      template: null,
      controller: 'LogoutController',
      resolve: {
        loginRequired: loginRequired
      }
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'templates/profile.html',
      controller: 'ProfileController',
      controllerAs: 'profile',
      resolve: {
        loginRequired: loginRequired
      }
    });

    function skipIfLoggedIn($q, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.reject();
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    function loginRequired($q, $location, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.resolve();
      } else {
        $location.path('/login');
      }
      return deferred.promise;
    }

}

/////////////////
// CONTROLLERS //
/////////////////

MainController.$inject = ["Account"]; // minification protection
function MainController (Account) {
  var vm = this;
  vm.currentUser = function() {
   return Account.currentUser();
  };

}

HomeController.$inject = ["$http"]; // minification protection
function HomeController ($http) {
  var vm = this;
  vm.champs = [];
  vm.compChamps = [];
  getChamps();

  vm.addChamp = function(champ){
    vm.compChamps.push(champ);
    var index = vm.champs.indexOf(champ);
    vm.champs.splice(index,1);
    vm.searchChamp = "";
  };

  vm.resetChamps = function(){
    vm.compChamps = [];
    vm.champs = [];
    getChamps();
  };

  function getChamps(){
    var champName = 'https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion?dataById=81&champData=all&api_key=5b0779a8-6a96-4ca0-ad88-95deb2561b41&alt=json-in-script&callback=JSON_CALLBACK';
    var champImg= 'http://ddragon.leagueoflegends.com/cdn/6.5.1/img/champion/';
      
    // var apiToken = $http.defaults.headers.common["X-API-TOKEN"];
    // delete $http.defaults.headers.common["X-API-TOKEN"];
    // $http.defaults.headers.common.Authorization = 'Basic YmVlcDpib29w';

    $http.get(champName)
      .then(function(summonerObj) {
        console.log(summonerObj);
        window.x = summonerObj.data.data;
        var x = summonerObj.data.data;
        for (var key in x ) {
          var img = x[key].image.full;
          var imgUrl = champImg + img;

          if (imgUrl === "http://ddragon.leagueoflegends.com/cdn/6.5.1/img/champion/AurelionSol.png") {
            imgUrl = 'http://www.mobafire.com/images/champion/icon/aurelion-sol.png';
          }
          vm.champs.push({"name": key, "img": imgUrl});
        }
      });
  }
}

CompsController.$inject = ["Account", "$http"]; // minification protection
function CompsController (Account, $http) {
  var vm = this;
  vm.posts = [];
  vm.new_post = {}; // form data
  vm.createPost = createPosts; 

  $http.get('/api/posts')
    .then(function (response) {
      vm.posts = response.data;
    });

  function createPosts(){
    $http.post('/api/posts', vm.new_post)
      .then(function(response){
        vm.posts.push(vm.new_post);
        vm.new_post = '';
    });
  }
}

ResultsController.$inject = ["compChamps"]; // minification protection
function ResultsController (compChamps) {
  console.log("in results controller");
  console.log('compChamps', compChamps);
  var vm = this;
  vm.compChamps = compChamps;


  // $http.get('/api/posts')
  //   .then(function (response) {
  //     vm.posts = response.data;
  //   });

  function createPosts(){
    $http.post('/api/posts', vm.new_post)
      .then(function(response){
        vm.posts.push(vm.new_post);
        vm.new_post = '';
    });
  }
}

LoginController.$inject = ["Account", "$location"]; // minification protection
function LoginController (Account, $location) {
  var vm = this;
  vm.new_user = {}; // form data

  vm.login = function() {
    Account
      .login(vm.new_user)
      .then(function(){
        vm.new_user = '';
         $location.path('/profile');
      });
  };
}

SignupController.$inject = ["Account", "$location"]; // minification protection
function SignupController (Account, $location) {
  var vm = this;
  vm.new_user = {}; // form data

  vm.signup = function() {
    Account
      .signup(vm.new_user)
      .then(
        function (response) {
          vm.new_user = '';
          $location.path('/profile');
        }
      );
  };
}

LogoutController.$inject = ["Account", "$location"]; // minification protection
function LogoutController (Account, $location) {
  Account.logout();
  $location.path('/login');
  // TODO #7: when the logout succeeds, redirect to the login page
}


ProfileController.$inject = ["Account", "$location"]; // minification protection
function ProfileController (Account, $location) {
  var vm = this;
  vm.new_profile = {}; // form data

  vm.updateProfile = function() {
    Account
      .updateProfile(vm.new_profile)
      .then(function(){
        vm.showEditForm = false;
      });
    // TODO #14: Submit the form using the relevant `Account` method
    // On success, clear the form
  };
}

ChampionController.$inject = ["Account", "$location"];
function ChampionController (Account, $location) {

  
}


//////////////
// Services //
//////////////
function compChamps(compChamps) {
  var self = this;
  self.compChamps = compChamps;
}


Account.$inject = ["$http", "$q", "$auth"]; // minification protection
function Account($http, $q, $auth) {
  var self = this;
  self.user = null;

  self.signup = signup;
  self.login = login;
  self.logout = logout;
  self.currentUser = currentUser;
  self.getProfile = getProfile;
  self.updateProfile = updateProfile;

  function signup(userData) {
    return(
      $auth
        .signup(userData)
        .then(
          function onSuccess(response) {
            console.log(response);
            $auth.setToken(response.data.token);
          },
          function onError(error) {
            console.error("error", error);
          }  
        )
      );
    // TODO #8: signup (https://github.com/sahat/satellizer#authsignupuser-options)
    // then, set the token (https://github.com/sahat/satellizer#authsettokentoken)
    // returns a promise
  }

  function login(userData) {
    return (
      $auth
        .login(userData) // login (https://github.com/sahat/satellizer#authloginuser-options)
        .then(
          function onSuccess(response) {
            $auth.setToken(response.data.token);
          },
          function onError(error) {
            console.error("error", error);
          }
        )
    );
  }

  function logout() {
    $auth.logout();
    self.user = null;
  }


  function currentUser() {
    if ( self.user ) { return self.user; }
    if ( !$auth.isAuthenticated() ) { return null; }

    var deferred = $q.defer();
    getProfile().then(
      function onSuccess(response) {
        self.user = response.data;
        deferred.resolve(self.user);
      },

      function onError() {
        $auth.logout();
        self.user = null;
        deferred.reject();
      }
    );
    self.user = promise = deferred.promise;
    return promise;

  }

  function getProfile() {
    return $http.get('/api/me');
  }

  function updateProfile(profileData) {
    return (
      $http
        .put('/api/me', profileData)
        .then(
          function (response) {
            self.user = response.data;
          }
        )
    );
  }


}
