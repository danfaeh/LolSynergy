// import { addChamp } from '../../service.js';
// var addChamp = require('../../services');

angular
  .module('LolSynergy', [
    'ui.router',
    'satellizer'
  ])
  .controller('MainController', MainController)
  .controller('HomeController', HomeController)
  .controller('ResultsController', ResultsController)
  .controller('LoginController', LoginController)
  .controller('SignupController', SignupController)
  .controller('LogoutController', LogoutController)
  .controller('ProfileController', ProfileController)
  .service('Account', Account)
  // .service('addChamp', addChamp)
  // .factory('Algorithm', Algorithm)
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
      controller: 'HomeController',
      controllerAs: 'champs'
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
  vm.bestChamps = [];
  vm.blue= [];
  vm.purple= [];
  vm.count = 0;
  vm.comps = {};
  vm.new_comp = {};
  vm.blueStart = true;
  vm.blueCount = 0;
  vm.purpleCount = 0;
  vm.lock=0;
  vm.showResults = false;
  getChamps(); 

/////////////////ALGORITHM////////////////////
  vm.results = function(){
      vm.showResults = true;

    //position Search
      var allPositions = ['top','mid','support','jungle','adc'];
      var positions = [];
      var positionsNeeded = [];  

      for (var i=0;i<vm.blue.length;i++){
        var newPosition = vm.blue[i].position;
        if (positions.indexOf(newPosition)===-1){
          positions.push(newPosition);
        } 
      }
   
      for (var k=0;k<5;k++){
        if (positions.indexOf(allPositions[k])===-1){
          positionsNeeded.push(allPositions[k]);
        } 
      }

      console.log("positions",positions);
      console.log("positions needed",positionsNeeded); 
      var champCount = vm.champs.length;
      var positionsNeededCount = positionsNeeded.length; 
      for (var j=0;j<champCount;j++){
        for (var z=0;z<positionsNeededCount;z++){
          if (vm.champs[j].position === positionsNeeded[z]){
            vm.bestChamps.push(vm.champs[j]);
          }
        }  
      }

  };
/////////////////ALGORITHM////////////////////  



// Adds Champ to Comp
  vm.addChamp = function(champ){

  if (vm.lock===0){
    if (vm.blue.length === 5 || vm.purple.length === 5){
      vm.lock = 1;
    }else if(vm.blue.length === 0 && vm.purple.length === 0){
      vm.blueStart ? vm.blue.push(champ) : vm.purple.push(champ);
      vm.count ++;
    } else if (vm.blue.length > vm.purple.length){
      vm.purple.push(champ);
      vm.count ++;
      vm.blueCount = 0;
      vm.purpleCount = 1;
    } else if (vm.purple.length > vm.blue.length){
      vm.blue.push(champ);
      vm.count ++;
      vm.blueCount = 1;
      vm.purpleCount = 0;
    } else if (vm.blueCount === 1){
      vm.blue.push(champ);
      vm.count ++;
      vm.blueCount = 0;
    } else if(vm.purpleCount === 1){
      vm.purple.push(champ);
      vm.count ++;
      vm.purpleCount = 0;
    }

    var index = vm.champs.indexOf(champ);
    vm.champs.splice(index,1);
  }
  };

  // Resets homepage champ selections
  vm.resetChamps = function(){
    vm.blue= [];
    vm.purple= [];
    vm.champs = [];
    vm.bestChamps = [];
    vm.count = 0;
    vm.lock = 0;
    getChamps();
  };

  vm.createComp = function(c1,c2,c3,c4,c5){
    console.log('inside create');
    $http.post('/api/comps', vm.new_post)
      .then(function(response){
        vm.comps.push(vm.new_comp);
        vm.new_post = '';
    });
  };

  // Get all champs from database
  function getChamps(){
    $http.get('/api/champs')
      .then(function(response) {
        var champs = response.data;
        var length = response.data.length;
        var champImg= 'http://www.mobafire.com/images/champion/icon/';

        // loop through all champs & grab image URLs
        for (var i=0;i<length;i++) {
          var imgUrl = champImg + champs[i].name + ".png";
          imgUrl = imgUrl.replace(/\s+/g, '-').replace(/'/,'').toLowerCase();
          vm.champs.push({"name": champs[i].name, "img": imgUrl, position: champs[i].position, damage: champs[i].damage,  hardcc: champs[i].hardcc, tank: champs[i].tank, engage: champs[i].engage,   seige:champs[i].seige, waveclear:champs[i].waveclear, aram: champs[i].aram});
        }
      });
  }
}



// CompsController.$inject = ["Account", "$http"]; // minification protection
// function CompsController (Account, $http) {
//   var vm = this;
//   vm.comps = {};
//   vm.new_comp = {}; // form data
//   vm.createPost = createComp; 
//   getChamps();

//   // Get all champs from database
//   function getChamps(){
//     $http.get('/api/champs')
//       .then(function(response) {
//         var champs = response.data;
//         var length = response.data.length;
//         var champImg= 'http://www.mobafire.com/images/champion/icon/';

//         // loop through all champs & grab image URLs
//         for (var i=0;i<length;i++) {
//           var imgUrl = champImg + champs[i].name + ".png";
//           imgUrl = imgUrl.replace(/\s+/g, '-').replace(/'/,'').toLowerCase();
//           vm.champs.push({"name": champs[i].name, "img": imgUrl});
//         }
//       });
//   }

//   function createComp(){
//     $http.post('/api/posts', vm.new_post)
//       .then(function(response){
//         vm.posts.push(vm.new_post);
//         vm.new_post = '';
//     });
//   }
// }

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
// addChamp.$inject = ["champ"]; // minification protection
// function addChamp(champ){
//    var index = vm.champs.indexOf(champ);
//     vm.champs.splice(index,1);

//     if (vm.blue.length === 5 && vm.purple.length === 5){
//       vm.lock = 1;
//     }else if(vm.blue.length === 0 && vm.purple.length === 0){
//       vm.blueStart ? vm.blue.push(champ) : vm.purple.push(champ);
//       vm.count ++;
//     } else if (vm.blue.length > vm.purple.length){
//       vm.purple.push(champ);
//       vm.count ++;
//       vm.blueCount = 0;
//       vm.purpleCount = 1;
//     } else if (vm.purple.length > vm.blue.length){
//       vm.blue.push(champ);
//       vm.count ++;
//       vm.blueCount = 1;
//       vm.purpleCount = 0;
//     } else if (vm.blueCount === 1){
//       vm.blue.push(champ);
//       vm.count ++;
//       vm.blueCount = 0;
//     } else if(vm.purpleCount === 1){
//       vm.purple.push(champ);
//       vm.count ++;
//       vm.purpleCount = 0;
//     }
// }

