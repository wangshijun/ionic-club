angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $firebaseAuth) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    var auth = $firebaseAuth();

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(loginModal) {
        $scope.loginModal = loginModal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.loginModal.hide();
    };

    // Open the login modal
    $scope.login = function() {
        $scope.loginModal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
        $scope.user = null;
        $scope.error = null;

        console.log('Doing login', $scope.loginData);

        var email = $scope.loginData.email;
        var password = $scope.loginData.password;

        if (!email) {
            $scope.error = '邮箱不能为空';
            return;
        }

        if (!password) {
            $scope.error = '密码不能为空';
            return;
        }

        auth.$signInWithEmailAndPassword(email, password).then(function (firebaseUser) {
            if (firebaseUser) {
                console.log(firebaseUser)
                $scope.user = firebaseUser;
                $scope.error = '登录成功!';
                $timeout(function() {
                    $scope.closeLogin();
                }, 2000);
            }
        }).catch(function (error) {
            console.log(error);
            $scope.error = error;
        });

    };
})

.controller('PlaylistsCtrl', function($scope, $firebaseObject) {
    $scope.playlists = [
        { title: 'Reggae', id: 1 },
        { title: 'Chill', id: 2 },
        { title: 'Dubstep', id: 3 },
        { title: 'Indie', id: 4 },
        { title: 'Rap', id: 5 },
        { title: 'Cowbell', id: 6 }
    ];

    var ref = firebase.database().ref('object');
    $scope.object = $firebaseObject(ref);
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
