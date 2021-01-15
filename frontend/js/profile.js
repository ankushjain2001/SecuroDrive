// // Page Content Loader
// var data = { 
//   UserPoolId : _config.cognito.userPoolId,
//   ClientId : _config.cognito.clientId
// };
// var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
// var cognitoUser = userPool.getCurrentUser();

// window.onload = function(){
//   if (cognitoUser != null) {
//     cognitoUser.getSession(function(err, session) {
//       if (err) {
//         alert(err);
//         return;
//       }
//       cognitoUser.getUserAttributes(function(err, result) {
//         if (err) {
//           // console.log(err);
//           return;
//         }
//         console.log(result);
//         document.getElementById("personalnameUpdate").innerHTML = result[2].getValue();	
//         document.getElementById("emailUpdate").innerHTML = result[5].getValue();	
//         document.getElementById("phoneUpdate").innerHTML = result[4].getValue();	
//       });			
//     });
//   }
//   else{
//     console.log('Error: User not authenticated')
//   }
// };