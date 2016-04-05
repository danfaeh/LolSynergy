console.log('connected to service file');

angular
  .module('LolSynergy.services', [
    'ui.router',
    'satellizer'
  ])
  .service('Service1', Service1)
  ;

// Service1.$inject = ["$http"]; // minification protection
function Service1(){
  //use players = {} instead of blue and purple to make this work.
  var vm = this;
  vm.blue= [];
  vm.purple= [];
  vm.blueCount = 0;
  vm.purpleCount = 0;
  vm.lock=0;
  vm.blueStart = true;
  vm.count= 0;
  vm.addChamp = function(champ){
    if (vm.lock===0){
      if (vm.blue.length === 5 || vm.purple.length === 5){
        vm.lock = 1;
        console.log("lock happened");
      }else if(vm.blue.length === 0 && vm.purple.length === 0){
        console.log("inside add 1st Champ", champ);
        vm.blueStart ?  vm.blue.push(champ) : vm.purple.push(champ);
        vm.count ++;
        if(vm.blue !== []){
          return vm.blue;
        }else{ return vm.purle; }

      } else if (vm.blue.length > vm.purple.length){
        console.log("inside add 2nd or 3rd Champ", champ);
        vm.purple.push(champ);
        vm.count ++;
        vm.blueCount = 0;
        vm.purpleCount = 1;
      } else if (vm.purple.length > vm.blue.length){
        console.log("inside add 4th or 5th Champ", champ);
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
    }
  };
}