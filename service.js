angular
  .service('Result', ResultFactory)
  .service('addChamp', addChamp);

function ResultFactory($resource) {
  return $resource('https://super-crud.herokuapp.com/books/:id', { id: '@_id' }, {
    update: {
      method: 'PUT' // this method issues a PUT request
    },
    query: {
      isArray: true,
      transformResponse: function(data) {
          return angular.fromJson(data).books;
      }
    }
  });
}

function addChamp(champ) {
var index = vm.champs.indexOf(champ);
    vm.champs.splice(index,1);

    if (vm.blue.length === 5 && vm.purple.length === 5){
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
}

module.exports = addChamp(champ);