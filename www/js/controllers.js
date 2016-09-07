angular.module('starter.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout, $firebaseAuth, $localStorage, ionicToast) {

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

    $rootScope.user = $localStorage.loginUser;
    auth.$onAuthStateChanged(function (firebaseUser) {
        if (firebaseUser) {
            $rootScope.user = $localStorage.loginUser = {
                displayName: firebaseUser.displayName,
                email: firebaseUser.email,
                uid: firebaseUser.uid,
            };
            $localStorage.loginDate = Date.now();
        } else {
            $localStorage.loginUser = $rootScope.user = null;
            $localStorage.loginDate = 0;
        }
    });

    $scope.isLoading = false;
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
            ionicToast.show('已注销!', 'bottom', false, 1000);
        });
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
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

.controller('PostListCtrl', function($rootScope, $scope, $firebaseArray, $interval, $localStorage, $timeout, $ionicModal, ionicToast) {
    var ref = firebase.database().ref('/posts').orderByChild('createdAt').limitToLast(20);
    var list = $firebaseArray(ref);
    $scope.posts = list;

    // Loading indicator
    $scope.error = null;
    $scope.isLoading = true;
    list.$loaded().then(function () {
        $scope.isLoading = false;
    }).catch(function (error) {
        $scope.isLoading = false;
        $scope.error = error.message;
    });

    $scope.postData = {};

    $ionicModal.fromTemplateUrl('templates/posts/form.html', {
        scope: $scope
    }).then(function(postFormModal) {
        $scope.postFormModal = postFormModal;
    });

    $scope.closePostForm = function() {
        $scope.postFormModal.hide();
    };

    $scope.openPostForm = function() {
        $scope.postFormModal.show();
    };

    $scope.categories = [
        '求职招聘',
        '技术交流',
        '谈天说地',
    ];

    $scope.addPost = function () {
        $scope.error = null;

        var content = $scope.postData.content;
        var title = $scope.postData.title;
        var category = $scope.postData.category;

        if (!title) {
            $scope.error = '请输入帖子标题';
            return;
        }

        if (!content) {
            $scope.error = '请输入帖子内容';
            return;
        }

        if (!category) {
            $scope.error = '请选择帖子分类';
            return;
        }

        list.$add({
            title: title,
            content: content,
            author: $rootScope.user.uid,
            authorName: $rootScope.user.displayName || $rootScope.user.email.split('@').shift(),
            category: category,
            likeCount: 0,
            commentCount: 0,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP,
        }).then(function () {
            console.log('post added', arguments);
            $scope.error = null;
            $scope.postData = {};
            ionicToast.show('帖子发布成功', 'bottom', false, 1000);
            $timeout(function () {
                $scope.closePostForm();
            }, 1000);
        }).catch(function (error) {
            $scope.error = error.message;
        });
    }
})

.controller('PostDetailCtrl', function($rootScope, $scope, $stateParams, $firebaseArray, $firebaseObject, ionicToast) {
    var refPost = firebase.database().ref('/posts/' + $stateParams.postId);
    var refComments = firebase.database().ref('/comments/' + $stateParams.postId);
    var post = $firebaseObject(refPost);
    var comments = $firebaseArray(refComments);

    $scope.isLoading = true;
    $scope.post = post;
    $scope.comments = comments;

    post.$loaded().then(function () {
        $scope.isLoading = false;
    }).catch(function (error) {
        $scope.error = error.message;
    });

    $scope.commentData = { comment: '' };
    $scope.addComment = function () {
        console.log($scope.commentData);

        if (!$scope.commentData.comment) {
            ionicToast.show('评论内容不能为空', 'middle', false, 1000);
            return;
        }

        comments.$add({
            content: $scope.commentData.comment,
            author: $rootScope.user.uid,
            authorName: $rootScope.user.displayName || $rootScope.user.email.split('@').shift(),
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP,
        }).then(function () {
            ionicToast.show('评论发表成功', 'middle', false, 1000);
            $scope.commentData.comment = '';
        }).catch(function (error) {
            $scope.error = error.message;
        });
    };
});
