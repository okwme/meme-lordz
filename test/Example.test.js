import request from 'supertest';
import chai from 'chai';
import crypto from 'crypto';
import '../app';
import graphqlDefaults from './graphql';
import Users from './../models/users';

describe ('Login flow tests', () => {

  let app;
  const buf = crypto.randomBytes(16);
  const email = `${buf.toString('hex')}@test.com`;
  let bizAdminToken;
  const bizAdminEmail = 'biz@admin.com';
  const bizAdminPass = 'Test1234';
  let companyId;
  let token1;
  let token2;
  let token3;
  let userId;
  const url = 'http://localhost:8080';
  let originalPasswordChange;

  before(function(done) {
    app = require('../app');
    Users.create({
      email: bizAdminEmail,
      password: bizAdminPass,
      roles: ['user', 'consensys'],
    }).then(() => done());
    // done();
  });

  describe ('UserController Tests', () => {
    it ('log in biz admin user', (done) => {
      request(url)
        .post('/login')
        .send({
          password: bizAdminPass,
          email: bizAdminEmail,
        })
        .expect(200)
        .then((res) => {
          bizAdminToken = res.body.token;
          chai.assert.equal(res.body.email, bizAdminEmail);
          done();
        })
        .catch(done);
    });

    it ('create company', (done) => {
      const data = {
        token: bizAdminToken,
        name: 'company',
      };
      const mutation = graphqlDefaults.addCompany(data);
      request(url)
        .post('/graphql')
        .send(mutation)
        .expect(200)
        .then((res) => {
          companyId = res.body.data.createCompany._id;
          chai.assert.equal(res.body.data.createCompany.name, 'company');
          chai.assert.equal(res.body.data.createCompany.settings.fiatCurrency, 'usd');
          chai.assert.equal(res.body.data.createCompany.settings.trackUnrealized, true);
          chai.assert.equal(res.body.data.createCompany.settings.gainsLossesMethod, 'fifo');
          done();
        })
        .catch(done);
    });

    it ('sign up a new account', (done) => {
      request(url)
        .post('/user')
        .set('token', bizAdminToken)
        .send({
          password: 'Test1234',
          name: 'test',
          email,
          company: companyId,
        })
        .expect(200)
        .then((res) => {
          token1 = res.body.token;
          userId = res.body._id;
          originalPasswordChange = Date.parse(res.body.passwordChangeDate);
          chai.assert.equal(res.body.name, 'test');
          chai.assert.equal(res.body.email, email);
          chai.assert.isBelow(Date.parse(res.body.createdDate), Date.now());
          chai.assert.isBelow(Date.parse(res.body.passwordChangeDate), Date.now());
          done();
        })
        .catch(done);
    });

    it ('sign up duplicate email', (done) => {
      request(url)
        .post('/user')
        .set('token', bizAdminToken)
        .send({
          password: 'Test1234',
          name: 'test',
          email,
          company: companyId,
        })
        .expect(400)
        .then((res) => {
          chai.assert.equal(res.body.errors[0].message, 'Duplicate email error');
          done();
        })
        .catch(done);
      });

    it ('change name', (done) => {
      const data = {
        token: token1,
        name: 'new',
      };
      const mutation = graphqlDefaults.updateUserAuth(data);
      request(url)
        .post('/graphql')
        .send(mutation)
        .expect(200)
        .then((res) => {
          chai.assert.equal(res.body.data.updateUserAuth.name, 'new');
          chai.assert.equal(res.body.data.updateUserAuth.email, email);
          done();
        })
        .catch(done);
    });


    it ('confirm wong password fails', (done) => {
      request(url)
        .post('/login')
        .send({
          password: '1234Test',
          email,
        })
        .expect(401)
        .then((res) => {
          chai.assert.equal(res.body.errors[0].message, 'Incorrect password');
          done();
        })
        .catch(done);
    });

    it ('confirm correct password works', (done) => {
      request(url)
        .post('/login')
        .send({
          password: 'Test1234',
          email,
        })
        .expect(200)
        .then((res) => {
          token2 = res.body.token;
          chai.assert.equal(res.body.email, email);
          done();
        })
        .catch(done);
    });

    it ('Should logout', () => {
      return request(url)
        .post('/logout')
        .send({
          token: token1,
        })
        .expect(200)
        .then((res) => {
          return chai.assert.equal(res.body.msg, `User ${userId} logged out`);
        })
    });

    it ('Confirm token no longer works after logout', () => {
      // @ to-do why does this need a timeout?
      setTimeout(() => {
        const data = {
          token: token1,
          name: 'hi',
        };
        const mutation = graphqlDefaults.updateUserAuth(data);
        return request(url)
          .post('/graphql')
          .send(mutation)
          .expect(200)
          .then((res) => {
            return chai.assert.equal(res.body.errors[0].message, 'blacklisted token');
          });
      }, 500);
    });
  });

  after(function(done) {
    Users.remove({
      email: bizAdminEmail,
    }).then(() => done());
  });

})
