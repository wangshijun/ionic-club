angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $firebaseAuth, $localStorage, ionicToast) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    var auth = $firebaseAuth();
    var login = function (email, password) {
        $scope.isLoading = true;
        auth.$signInWithEmailAndPassword(email, password).then(function (firebaseUser) {
            $scope.isLoading = false;
            if (firebaseUser) {
                console.log(firebaseUser)
                $scope.user = $localStorage.loginUser = {
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    uid: firebaseUser.uid,
                };
                $localStorage.loginDate = Date.now();
                ionicToast.show('登录成功!', 'bottom', false, 1000);
                $timeout(function() {
                    $scope.closeLogin();
                }, 1000);
            }
        }).catch(function (error) {
            console.log('login error:', error)
            $scope.isLoading = false;
            $scope.error = error.message;
        });
    }

    $scope.isLoading = false;
    $scope.user = $localStorage.loginUser;
    $scope.error = null;

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
    $scope.openLogin = function() {
        $scope.loginModal.show();
        $scope.registerModal.hide();
    };

    $scope.logout = function() {
        auth.$signOut().then(function () {
            $localStorage.loginUser = $scope.user = null;
            $localStorage.loginDate = 0;
            ionicToast.show('已注销!', 'bottom', false, 1000);
        });
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

        login(email, password);
    };

    // Form data for the register modal
    $scope.registerData = {};

    // Create the register modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function(registerModal) {
        $scope.registerModal = registerModal;
    });

    // Triggered in the register modal to close it
    $scope.closeRegister = function() {
        $scope.registerModal.hide();
    };

    // Open the register modal
    $scope.openRegister = function() {
        $scope.loginModal.hide();
        $scope.registerModal.show();
    };

    // Perform the register action when the user submits the register form
    $scope.doRegister = function() {
        $scope.user = null;
        $scope.error = null;
        console.log('Doing register', $scope.registerData);

        var email = $scope.registerData.email;
        var password = $scope.registerData.password;
        var confirmPassword = $scope.registerData.confirmPassword;

        $scope.firebaseUser = null;
        $scope.error = null;

        if (!email) {
            $scope.error = { message: '请填写正确的邮箱' };
            return;
        }

        if (!password) {
            $scope.error = { message: '请填写登录密码' };
            return;
        }

        $scope.isLoading = true;
        if (!confirmPassword || confirmPassword !== password) {
            $scope.error = { message: '请填写正确的确认密码' };
            return;
        }

        auth.$createUserWithEmailAndPassword(email, password).then(function (firebaseUser) {
            console.log('register success:', firebaseUser);
            ionicToast.show('注册成功，即将自动登录', 'middle', false, 1000);
            $timeout(function () {
                $scope.registerModal.hide();
                login(email, password);
            }, 1000);
        }).catch(function (error) {
            console.log('register error:', error)
            $scope.error = error.message;
            $scope.isLoading = false;
        });
    };

})

.controller('PostListCtrl', function($scope, $firebaseArray, $interval, $localStorage) {
    var ref = firebase.database().ref('/posts').orderByChild('createAt').limitToLast(10);
    var list = $firebaseArray(ref);
    var user = $localStorage.loginUser;

    $scope.posts = list;

    $scope.error = null;
    $scope.isLoading = true;
    list.$loaded().then(function () {
        $scope.isLoading = false;
    }).catch(function (error) {
        $scope.isLoading = false;
        $scope.error = error.message;
    });
    
    // var postCount = 1;
    // $interval(function () {
    //     list.$add({
    //         title: 'New Post #' + postCount,
    //         content: 'Content for New Post #' + postCount,
    //         author: user.uid,
    //         category: 'default',
    //         createAt: Date.now(),
    //         updatedAt: Date.now(),
    //     }).then(function () {
    //         console.log('post added', postCount, arguments);
    //     });
    //
    //     postCount++;
    // }, 1000);
})

.controller('PostDetailCtrl', function($scope, $stateParams) {
});
