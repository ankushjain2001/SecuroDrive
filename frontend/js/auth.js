var current_user_email = '';
// Cognito - Register function
function register(e) {
  e.preventDefault();
      
  // Information
  var personalname =  document.getElementById("personalnameRegister").value;	
  var username = document.getElementById("emailInputRegister").value;
  var phone = document.getElementById("phoneRegister").value;	
  
  if (document.getElementById("passwordInputRegister").value != document.getElementById("confirmationpassword").value) {
    alert("Passwords Do Not Match!")
    throw "Passwords Do Not Match!"
  } else {
    var password =  document.getElementById("passwordInputRegister").value;	
  }

  // Image
  var file = $("#profilePicture")[0].files[0];
  if(file === undefined){
    alert("Upload an image!")
    throw "Upload an image!"
  }

  // Cognito setup
  var poolData = {
    UserPoolId : _config.cognito.userPoolId,
    ClientId : _config.cognito.clientId
    };		
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  var attributeList = [];
  
  var dataEmail = {
    Name : 'email', 
    Value : username,
  };
  
  var dataPersonalName = {
    Name : 'name', 
    Value : personalname,
  };

  var dataPhone = {
    Name : 'phone_number', 
    Value : phone,
  };

  var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
  var attributePersonalName = new AmazonCognitoIdentity.CognitoUserAttribute(dataPersonalName);
  var attributePhone = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhone);
  
  
  attributeList.push(attributeEmail);
  attributeList.push(attributePersonalName);
  attributeList.push(attributePhone);

  userPool.signUp(username, password, attributeList, null, function(err, result){
    if (err) {
      alert(err.message || JSON.stringify(err));
      return;
    }
    cognitoUser = result.user;
    console.log('Username: ' + cognitoUser.getUsername());

    // Send data to lambda for photo indexing in rekognition
    // Image
    var reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = function() {
      // console.log(btoa(reader.result));
      $.ajax({
        url: "https://6mkswi5hrf.execute-api.us-east-1.amazonaws.com/dev/auth/register",
        type: "POST",
        data: JSON.stringify({
          "name" : personalname,
          "email" : username,
          "phone" : phone,
          "image": btoa(reader.result)
        }),
        // beforeSend: function(xhr){
        //   xhr.setRequestHeader('x-api-key', 'UPpQWQNa8Q6mYWT2pHSg7aAjhqldY1vC1f6EWduq'); // Not safe but the HW doesn't ask for any secure way to do this
        // },
        error: function(res) {
          console.log(res)
        },
        success: function(res) { 
          console.log('Lambda Success')
          console.log(res);
        }
     });
    };
    reader.onerror = function() {
        console.log('there are some problems in image upload');
    };
    

    document.getElementById("alert-register").innerHTML = "Check your email for a verification link";
    
  });
};


// Cognito - Log in function
function logIn(e) {
  e.preventDefault();
  var authenticationData = {
    Username : document.getElementById("usernameLogin").value,
    Password : document.getElementById("passwordLogin").value,
  };
  
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    
  var poolData = {
    UserPoolId : _config.cognito.userPoolId,
    ClientId : _config.cognito.clientId,
    };
  
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  
  var userData = {
    Username : document.getElementById("usernameLogin").value,
    Pool : userPool,
  };
  
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      var accessToken = result.getAccessToken().getJwtToken();
      // console.log(accessToken);
      window.location.reload();
    },
    onFailure: function(err) {
      alert(err.message || JSON.stringify(err));
    },
  });
};

// Cognito - Log out function
function logOut(){
  if (cognitoUser != null) {
    cognitoUser.signOut();	  
  }
  window.location.reload();
};


// Cognito - Update function
function update(e) {
  e.preventDefault();
  document.getElementById("spin-loader").style.display = "inline-block";
  var personalname =  document.getElementById("personalnameUpdate").value;	
  var username = document.getElementById("emailInputUpdate").value;
  var phone = document.getElementById("phoneUpdate").value;	
  var noErrors = false;

  if (personalname.length !=0 && username.length != 0 && phone.length != 0) {
    noErrors = true;
  }
  else {
    alert('Fields cannot be empty.')
  }

 

  var attributeList = [];
  
  var dataEmail = {
    Name : 'email', 
    Value : username,
  };
  
  var dataPersonalName = {
    Name : 'name', 
    Value : personalname,
  };

  var dataPhone = {
    Name : 'phone_number', 
    Value : phone,
  };

  var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
  var attributePersonalName = new AmazonCognitoIdentity.CognitoUserAttribute(dataPersonalName);
  var attributePhone = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhone);
  
  attributeList.push(attributeEmail);
  attributeList.push(attributePersonalName);
  attributeList.push(attributePhone);
  

  // Call when no errors exist in password or other info
  if (noErrors == true){
    cognitoUser.updateAttributes(attributeList, function(err, data) {
      if (err) { 
        console.log(err, err.stack); // an error occurred
      }

        console.log(data); // successful response for other info

        // Send data to lambda for photo indexing in rekognition
        // Image
        var file = $("#profilePictureUpdate")[0].files[0];
        console.log(file)

        if(file === undefined){
          var req_data = {
            "name" : personalname,
            "email" : username,
            "phone" : phone,
            "existing_email" : current_user_email
          };
          console.log(req_data);
          $.ajax({
            url: "https://6mkswi5hrf.execute-api.us-east-1.amazonaws.com/dev/auth/update",
            type: "POST",
            data: JSON.stringify(req_data),
            // beforeSend: function(xhr){
            //   xhr.setRequestHeader('x-api-key', 'UPpQWQNa8Q6mYWT2pHSg7aAjhqldY1vC1f6EWduq'); // Not safe but the HW doesn't ask for any secure way to do this
            // },
            error: function(res) {
              console.log(res)
            },
            success: function(res) { 
              console.log('Lambda Success')
              console.log(res);
              window.location.reload();
            }
          });

        }
        else {
          var reader = new FileReader();
          reader.readAsBinaryString(file);
          reader.onload = function() {
            req_data = {
              "name" : personalname,
              "email" : username,
              "phone" : phone,
              "existing_email" : current_user_email,
              "image": btoa(reader.result)
            }
            // console.log(btoa(reader.result));
            $.ajax({
              url: "https://6mkswi5hrf.execute-api.us-east-1.amazonaws.com/dev/auth/update",
              type: "POST",
              data: JSON.stringify(req_data),
              // beforeSend: function(xhr){
              //   xhr.setRequestHeader('x-api-key', 'UPpQWQNa8Q6mYWT2pHSg7aAjhqldY1vC1f6EWduq'); // Not safe but the HW doesn't ask for any secure way to do this
              // },
              error: function(res) {
                console.log(res)
              },
              success: function(res) { 
                console.log('Lambda Success')
                console.log(res);
                window.location.reload();
              }
            });
          };
          reader.onerror = function() {
              console.log('there are some problems in image upload');
          };
        }    
    });
  }
};

// Cognito - Change password function
function changePassword(e) {
  e.preventDefault();
  document.getElementById("spin-loader-2").style.display = "inline-block";
  var oldPassword = document.getElementById("oldPasswordUpdate").value;
  var newPassword = document.getElementById("newPasswordUpdate").value;	
  var confirmPassword = document.getElementById("confirmPasswordUpdate").value;
  var noErrors = false;

  if (oldPassword.length != 0){
    if (confirmPassword === newPassword) {
      noErrors = true;
    }
    else {
      alert('Passwords not matching')
    }
  }
  else{
    alert('Enter old and new passwords to continue')
  }

  // Call when no errors exist in password or other info
  if (noErrors == true){
    cognitoUser.changePassword(oldPassword, newPassword, function(err, result) {
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }
      console.log(result); // success response for password
      window.location.reload();
    });
  }
};


// Page Content Loader
var data = { 
  UserPoolId : _config.cognito.userPoolId,
  ClientId : _config.cognito.clientId
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
var cognitoUser = userPool.getCurrentUser();

window.onload = function(){
  if (cognitoUser != null) {

    document.getElementById("home-page").style.display = "block"; // logged in
    document.getElementById("home-page-menu").style.visibility = "visible";
    document.getElementById("home-page-toggler").style.visibility = "visible";

    cognitoUser.getSession(function(err, session) {
      if (err) {
        alert(err);
        return;
      }
      // console.log('Session Valid: ' + session.isValid());
      cognitoUser.getUserAttributes(function(err, result) {
        if (err) {
          // console.log(err);
          return;
        }
        // console.log(result);
        // Save user email to local storage
        localStorage.setItem("current_user_email", result[5].getValue());
        // console.log(localStorage.getItem("current_user_email"))
        // Set user name
        document.getElementById("home-text").innerHTML = result[2].getValue();
        // Profile Page (special case)
        if (window.location.pathname == '/profile.html'){
          current_user_email = result[5].getValue();
          document.getElementById("personalnameUpdate").value = result[2].getValue();	
          document.getElementById("emailInputUpdate").value = result[5].getValue();	
          document.getElementById("phoneUpdate").value = result[4].getValue();
          document.getElementById("dpFrame").src = "https://project-frontend-web.s3.amazonaws.com/img/users/"+result[5].getValue()+".jpeg?" + new Date().getTime();
        }

      });			
    });
  }
  else{
    var authPageElement = document.getElementById("auth-page")
    if (authPageElement) {
      authPageElement.style.display = "block"; // not logged in
      document.body.style.backgroundImage = "url(img/background.jpg)";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundSize = "cover";
    }
    else {
      window.location.href = './';
    }
  }
};
