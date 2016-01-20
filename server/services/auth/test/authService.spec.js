// 'use strict';

// // Locals
// import testUtils from './../../../utils/testUtils';
// // import authService from './../authService';

// let app = testUtils.app;
// let requester = testUtils.requester;
// let testUser = testUtils.testUser;
// let serviceRegistry = testUtils.serviceRegistry;

// let authService = serviceRegistry.registry.services['auth'];



// xdescribe('Auth: ', () => {
  
//   // LOG IN

//   describe('Logging In: ', () => {

//     let user;
//     let token;
//     let logInUrl = authService.url + '/login';

//     beforeAll((done) => {
//       testUtils.initSuite(authService.name)

//       testUtils.clearLocalTestDatabase()
//         .then(() => testUtils.addTestUser())
//         .then((testUser) => {
//           user = testUser;
//           done();
//         });
//     });

//     afterAll((done) => {
//       testUtils.clearLocalTestDatabase()
//       .then(() => {
//         done();
//       });
//     });



//     it('does not log in a user that cannot be found', (done) => {
//       let nonExistentUser = { email: 'someValid@email.com', password: 'somepassw0rd' };

//       requester
//         .post(logInUrl)
//         .send(nonExistentUser)
//         .expect(404)
//         .expect('Content-Type', /json/)
//         .end((err, res) => {
//           expect(res.body.message).toBe('user not found');
//           expect(res.body.status).toBe(404);
//           done();
//         });
//     });

//     it('logs in an existing valid user', (done) => {
//       requester
//         .post(logInUrl)
//         .send({ email: testUser.email, password: testUser.password })
//         .expect(404)
//         .expect('Content-Type', /json/)
//         .end((err, res) => {
//           expect(res.body.token).toBeDefined();
//           expect(res.body.user).toBeDefined();
//           done();
//         });
//     });
//   });  

// });
