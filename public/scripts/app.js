angular
  .module('LolSynergy', [
    'ui.router',
    'satellizer'
    // 'LolSynergy.services'
  ])
  .controller('MainController', MainController)
  .controller('HomeController', HomeController)
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
      controller: 'HomeController',
      controllerAs: 'champs'
    })
    .state('aram', {
      url: '/aram',
      templateUrl: 'templates/aram.html',
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

HomeController.$inject = ["$http", "$window","$scope"]; // minification protection
function HomeController ($http, $window, $scope) {
  var vm = this;
  vm.champs = [];
  vm.positionChamps = [];
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
  vm.showPositions = false;
  vm.champSelect = true;
  getChamps();

/////////////////ALGORITHM////////////////////
  vm.positionMenu = function(){
    vm.showPositions = true;
    vm.champSelect = false;
  };

  vm.results = function(positionNeeded){
    vm.showPositions = false;
    vm.showResults = true;

    vm.position = positionNeeded;
    vm.ccChamps = [];
    vm.seigeChamps = [];
    vm.waveClearChamps = [];
    vm.engageChamps = [];
    vm.tankChamps = [];
    var allDamage = [];

    vm.damageNeeded=null;
    vm.hasTank = false;
    vm.hasSeige = false;
    vm.hasWaveClear = 0;
    vm.hasCC = 0;
    vm.hasEngage = false;

    vm.comps = [];


      //Decides if team needs AP Damage or not
      for (i=0;i<vm.blue.length;i++){
        allDamage.push(vm.blue[i].damage);
          if (vm.blue[i].tank === true){
            vm.hasTank = true; //medium
          }
          if (vm.blue[i].engage === true){
            vm.hasEngage = true; //high
          }  
          if (vm.blue[i].waveclear === true){
            //make it so at least 2 wave clear champs per team
            vm.hasWaveClear ++; //low
          }  
          if (vm.blue[i].seige === true){
            vm.hasSeige = true; //high
          }
          if (vm.blue[i].hardcc > 1){
            vm.hasCC ++; //medium
          }     
      }

      var needAP = false;
      var needAD = false;
      allDamage.indexOf("ap")===-1 ? needAP = true : needAP = false;
      allDamage.indexOf("ad")===-1 ? needAD = true : needAD = false;

      //goes through all champs. Collects them in an array if they fit the desired position. 
      //also considers if team needs a certain damage type, and only shows that type.
      var champCount = vm.champs.length;
      for (i=0;i<champCount;i++){
        if (vm.champs[i].position === positionNeeded){
          if (needAP === true){
            vm.damageNeeded = "ap"
            if (vm.champs[i].damage === "ap" || vm.champs[i].tank ===true){ 
              vm.positionChamps.push(vm.champs[i]);
            }
          }else if (needAD === true){
            vm.damageNeeded = "ad"
            if (vm.champs[i].damage === "ad" || vm.champs[i].tank ===true){ 
              vm.positionChamps.push(vm.champs[i]);
            }
          }else{
            vm.positionChamps.push(vm.champs[i]);
          }
        }    
      }

      var positionChampCount = vm.positionChamps.length;
      for (i=0;i<positionChampCount;i++){   
        if (vm.positionChamps[i].seige === true){
          vm.seigeChamps.push(vm.positionChamps[i])
        }
        if (vm.positionChamps[i].waveclear === true){
          vm.waveClearChamps.push(vm.positionChamps[i])
        }
        if (vm.positionChamps[i].engage === true){
          vm.engageChamps.push(vm.positionChamps[i])
        }
        if (vm.positionChamps[i].tank === true){
          vm.tankChamps.push(vm.positionChamps[i])
        }
        if ((vm.positionChamps[i].hardcc > 0 && vm.positionChamps[i].hardcc > 0) || vm.positionChamps[i].hardcc > 1){
          vm.ccChamps.push(vm.positionChamps[i])
        }
      }

};

// Adds Champ to Comp
  vm.addChamp = function(champ){
    if (vm.lock===0){
      $scope.searchChamp = '';
      if ((vm.blueStart === false && vm.purple.length === 5) || (vm.blueStart === true && vm.blue.length === 4 && vm.purple.length === 4)){
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
    vm.positionChamps = [];
    vm.count = 0;
    vm.lock = 0;
    vm.showResults = false;
    vm.showPositions = false;
    vm.champSelect = true;
    getChamps();
  };

  vm.addChampFromSearch = function(champName){
    name = champName.charAt(0).toUpperCase() + champName.slice(1);
    console.log("champ", name);

    var allChamps = vm.champs.length;
    for (var z=0; z<allChamps; z++ ){
      if (vm.champs[z].name === name){
        champObject = vm.champs[z];
        break;
      }
    }
    console.log("champObject", champObject);
    vm.addChamp(champObject);
  }

  vm.findCounter = function(champ){
    console.log("inside find counter")
    $window.open('https://www.google.com', '_blank');
  }

  vm.createComp = function(){
    console.log('inside create');
    $http.post('/api/comps', vm.new_comp)
      .then(function(response){
        vm.comps.push(vm.new_comp);
        vm.new_comp = '';
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
          vm.champs.push({"name": champs[i].name, "img": imgUrl, position: champs[i].position, damage: champs[i].damage,  hardcc: champs[i].hardcc, softcc: champs[i].softcc, tank: champs[i].tank, engage: champs[i].engage,   seige:champs[i].seige, waveclear:champs[i].waveclear, aram: champs[i].aram});
        }
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


