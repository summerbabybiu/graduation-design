/**
 * Created by xx on 16/3/20.
 */
//leancloud initlize
var array_course = new Array();
$(document).ready(function() {
	AV.initialize('iuO5g66bCpCVIhnRtQnmn3YA-gzGzoHsz', 'xkRJahD7klcYeHQ3BDVbbwDS');
	//加载导航栏
	var currentUser = AV.User.current();
	if (currentUser) {
		// do stuff with the user
		$('#cover_name').text(currentUser.get('username'));
		$('#cover_name').append('<i class="mdi-navigation-arrow-drop-down right"></i>');
		$('#nav-mobile2').addClass('hide');
		$('#nav_user').removeClass('hide');
	}
	readRecord();
});

function readRecord() {
	var currentUser = AV.User.current();
	var query = new AV.Query('Record');
	query.equalTo('user', currentUser.get('username'));
	query.find().then(function(results) {
	console.log('Successfully retrieved ' + results.length + ' posts.');
	  // 处理返回的结果数据
	  for (var i = 0; i < results.length; i++) {
	    var object = results[i];
	    if (object.get('chapter') !== undefined){
	   // console.log(object.get('courseKind') + ' - ' + object.get('chapter'));
	    sessionStorage.setItem([object.get('courseKind')],[object.get('chapter')]);
	    }

	  }
	}, function(error) {
	  console.log('Error: ' + error.code + ' ' + error.message);
	});
}


function register() {
	var userName = $("#register_name").val();
	var userEmail = $("#register_email").val();
	var userPassword = $("#register_password").val();
	console.log('userName: ' + userName + 'userEmail: ' + userEmail + 'userPassword: ' + userPassword);
	if (userName && userEmail && userPassword) {
		var user = new AV.User();
		user.set('username', userName);
		user.set('password', userPassword);
		user.set('email', userEmail);
		user.signUp().then(function(user) {
			Materialize.toast("注册成功", 3000, 'rounded');
			window.location.reload();
		}, function(error) {

			alert(error.message);
		});
	} else {
		alert("任意一项不能为空!");
	}

}

function enter() {
	var typeEmail = $('#login_email').val();
	var typePassword = $('#login_password').val();
	AV.User.logIn(typeEmail, typePassword).then(function() {
		// 成功了，现在可以做其他事情了
		location.reload();
	}, function() {
		// 失败了
		Materialize.toast("密码或用户名不正确！", 3000, 'rounded');
	});

}

function log_out() {
	AV.User.logOut();
	location.reload();
}

function resetPassword() {
	console.log($('#login_email').val());
	//判断邮箱格式是否正确
	var myreg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
	if (myreg.test($('#login_email').val())) {
		//判断邮箱是存在
		var query = new AV.Query('_User');
		query.equalTo('email', $('#login_email').val());
		query.find().then(function(results) {
			if (results.length == 0) {
				Materialize.toast("邮箱未注册！请先注册", 3000, 'rounded');
			} else if (results.length == 1) {
				AV.User.requestPasswordReset($('#login_email').val()).then(function() {
					// Password reset request was sent successfully
					Materialize.toast("重置链接发送成功，请注意查收邮件！", 3000, 'rounded');
				}, function(error) {
					// Show the error message somewhere
					console.log('Error: ' + error.code + ' ' + error.message);
				});
			}
		}, function(error) {
			console.log('Error: ' + error.code + ' ' + error.message);
		});
	} else {
		alert('找回密码请输入正确的邮箱地址！');
	}
}

function changePassword() {
	var newpass = $('#new_p').val();
	var compass = $('#confirm_p').val();
	if (newpass == "" | compass == "") {
		alert('密码不能为空！');
	} else {
		if (newpass === compass) {
			var user = AV.User.current();
			user.setPassword(newpass);
			user.save().then(function() {
				// 成功
				AV.User.logOut();
				Materialize.toast("密码修改成功！", 1000, 'rounded');
			});
			setTimeout(function() {
				location.reload();
			}, 1001);

		} else {
			alert('两次密码不匹配！');
			$('#new_p').val('');
			$('#confirm_p').val('');
		}
	}
}

function getCourse(event) {

	var currentUser = AV.User.current();
	if (currentUser) {
		var x = event.target;
		console.log("The id of the triggered element: " + x.id);
		sessionStorage.kind = x.id;
	if (sessionStorage[x.id] == undefined) {
			sessionStorage.setItem(x.id,1);
		}
		//console.log(sessionStorage.getItem([x.id]));		
		var query = new AV.Query('Record');
		query.equalTo('user', currentUser.get('username'));
		query.equalTo('courseKind', sessionStorage.kind );
		query.find().then(function(results) {
			console.log(results.length);
		  if(results.length == 0) {
		  	setRecord();
		  }	 else {
		  	sessionStorage.recordID = results[0].id;
		  }
		}, function(error) {
		  console.log('Error: ' + error.code + ' ' + error.message);
		});
		
		loadCourse();
	} else {
		alert('请先登录！');
	}
}

function loadCourse() {
		var kind = sessionStorage.getItem('kind');
		var chapterNu = sessionStorage.getItem(kind);
		//加载课程信息
		var query = new AV.Query(kind);
		query.find().then(function(results) {
		//	console.log('Successfully retrieved ' + results.length + ' posts.');
			sessionStorage.courseLength = results.length;
			// 处理返回的结果数据
			
			var object = results[chapterNu-1];
			var order = object.get('order');
			var title = object.get('title');
			var content = object.get('content');
			var des = object.get('description');
			var demoString = object.get('demo');

	//显示相应课程的每个章节信息 
		$('.course').addClass('hide');
		$('.nav_sider').addClass('hide');
		$('.show_detail').removeClass('hide');

		$('.show_detail .card-title').text('第' + chapterNu + '节————' + title);
		$('.description').text('描述： ' + des);
		if (content !== undefined) {
			$('.course_content').removeClass('hide');
			$('.course_content').text('内容：' + content);
		} else {
			$('.course_content').text('');
		}
		if (demoString !== undefined) {
			$('.show_code pre').removeClass('hide');
			$('.show_code pre').text(demoString);
		} else {
			$('.show_code pre').addClass('hide');
		}


		}, function(error) {
			console.log('Error: ' + error.code + ' ' + error.message);
		});
}


function setRecord(){
	var currentUser = AV.User.current();
	var kind = sessionStorage.getItem('kind');
	var Record = AV.Object.extend('Record');
	var record = new Record();
	record.save({
	  user: currentUser.get('username'),
	  courseKind: kind,
	}).then(function(record) {
	  // 实例已经成功保存.
	  console.log('success');
	  console.log(record.id);
	  sessionStorage.recordID = record.id;
	}, function(err) {
	  // 失败了.
	  console.log('fail');
	});
}

function updateChapter(){
	var Record = AV.Object.extend('Record');
	var query = new AV.Query(Record);
	
	// 这个 id 是要修改条目的 objectId，你在生成这个实例并成功保存时可以获取到，请看前面的文档
	query.get(sessionStorage.recordID).then(function(record) {
	  // 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
	  record.set('chapter', sessionStorage.getItem(sessionStorage.getItem('kind')));
	  record.save();
	}, function(error) {
	  // 失败了
	});
}


function finishStatus(){
	var Record = AV.Object.extend('Record');
	var query = new AV.Query(Record);
	
	// 这个 id 是要修改条目的 objectId，你在生成这个实例并成功保存时可以获取到，请看前面的文档
	query.get(sessionStorage.recordID).then(function(record) {
	  // 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
	  record.set('finsih', true);
	  record.save();
	}, function(error) {
	  // 失败了
	});
}

function getLast() {
	//console.log(sessionStorage.getItem(sessionStorage.getItem('kind')));
	var num = sessionStorage.getItem(sessionStorage.getItem('kind'));
	if (num == 1) {
		Materialize.toast("已经是第一节啦", 3000, 'rounded');
	} else {
		num--;
		updateChapter();
		sessionStorage.setItem(sessionStorage.getItem('kind'),num);
		loadCourse();
	}
}

function getNext() {
	var num = sessionStorage.getItem(sessionStorage.getItem('kind'));
	var cL = sessionStorage.getItem('courseLength');
	//console.log(num+"-----------"+cL);
	if (num == cL) {
		finishStatus();
		var r = confirm("恭喜你完成本次课程！返回首页？");
		if (r == true) {
			location.reload();
		}
		//		else {
		//		    
		//		}
	} else {
		num++;
		updateChapter();
		sessionStorage.setItem(sessionStorage.getItem('kind'),num);
		loadCourse();
	}
}


