'use strict';

describe('Zergling service', function () {
    var Zergling, WS, Config, $rootScope, $httpBackend;


    beforeEach(function () {
        angular.mock.module('vbet5');
        angular.mock.module('vbet5.Mocks');
    });


    beforeEach(inject(function (_Zergling_, _$rootScope_, _WS_, _Config_, _$httpBackend_) {
        WS = _WS_;
        Zergling = _Zergling_;
        Config = _Config_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        console.log('---------------------------------\n');
    }));


    it('should have all needed methods', function () {
        expect(Zergling.subscribe).not.toEqual(null);
        expect(Zergling.unsubscribe).not.toEqual(null);
        expect(Zergling.get).not.toEqual(null);
        expect(Zergling.login).not.toEqual(null);
    });

    describe('Zergling Websocket functionality', function () {

        it('should be able to subscribe', function () {
            var result;
            Zergling.subscribe({'source': 'betting', 'what': {'sport': []}, 'where': {'game': {'type': 1}}}, function (data) {
                console.log('subscribtion callback:', data);
            }).then(function (res) { result = res; })
              .finally(function () {
                expect(result).toBeDefined();
                expect(typeof result.subid).toEqual('string');
                expect(result.data).toBeDefined();
              }).catch(function () {this.fail('exception should not occur here!'); });
            $rootScope.$apply();
        });

        it('should be able to subscribe when session is lost', function () {
            WS.failForNextRequestWithCode(5);
            var res;
            Zergling.subscribe({'source': 'betting', 'what': {'sport': []}, 'where': {'game': {'type': 1}}}, function (data) {
                console.log('subscribtion callback:', data);
            }).then(function (result) {
                res = result;
            }).finally(function () {
                expect(res).toBeDefined();
                expect(typeof res.subid).toEqual('string');
                expect(res.data).toBeDefined();
            }).catch(function () {this.fail('exception should not occur here!'); }.bind(this));
            $rootScope.$apply();
        });

        it('should be able to hande error response', function () {
            WS.failForNextRequestWithCode(1);
            var res;
            Zergling.subscribe({'source': 'betting', 'what': {'sport': []}, 'where': {'game': {'type': 1}}}, function (data) {
                console.log('subscribtion callback:', data);
            }).then(function (result) {
                res = result;
            }).finally(function () {
                expect(res).toBeUndefined();
            });
            $rootScope.$apply();
        });

        it('should be able to unsubscribe', function () {

            var res;
            Zergling.unsubscribe('subscription_id', function (data) {
                console.log('unsubscribtion callback:', data);
            }).then(function (response) {
                return res = response;
            }).finally(function () {
                expect(res).toBeDefined();
                expect(res.data.code).toEqual(0);
            }).catch(function () {this.fail('exception should not occur here!'); }.bind(this));
            $rootScope.$apply();
        });

        it('should handle invalid unsubscribe response', function () {

            WS.failForNextRequestWithCode(1);
            var res;
            Zergling.unsubscribe('subscription_id', function (data) {
                console.log('unsubscribtion callback:', data);
            }).then(function (response) {
                return res = response;
            }).finally(function () {
                expect(res).toBeUndefined();
            });
            $rootScope.$apply();
        });

        it('should be able to unsubscribe when session is lost', function () {

            WS.failForNextRequestWithCode(5);
            var res;
            Zergling.unsubscribe('subscription_id', function (data) {
                console.log('unsubscribtion callback:', data);
            }).then(function (response) {
                    return res = response;
                }).finally(function () {
                    expect(res).toBeDefined();
                    expect(res.data.code).toEqual(0);
                }).catch(function () {this.fail('exception should not occur here!'); }.bind(this));
            $rootScope.$apply();
        });

        it('should be able to get', function () {
            var result;
            Zergling.get({'source': 'betting', 'what': {'sport': []}, 'where': {'game': {'type': 1}}})
                .then(function (res) {result = res; })
                .finally(function () {
                    expect(result).toBeDefined();
                    expect(typeof result.data).toEqual('object');
                    expect(result.data).toBeDefined();
                }).catch(function () {this.fail('exception should not occur here!'); }.bind(this));
            $rootScope.$apply();
        });

        it('should be able to get when session lost', function () {
            var result;
            WS.failForNextRequestWithCode(5);
            Zergling.get({'source': 'betting', 'what': {'sport': []}, 'where': {'game': {'type': 1}}}, function (data) {
                console.log('get callback:', data);
            }).then(function (result) {
                    console.log('get data', result);
                    expect(result).toBeDefined();
                    expect(typeof result.data).toEqual('object');
                    expect(result.data).toBeDefined();
                }).catch(function () {this.fail('exception should not occur here!'); }.bind(this).bind(this));
            $rootScope.$apply();
        });

        it('should be able to login', function () {
            var result;
            Zergling.login({username: 'u', password: 'p'}).then(function (res) {
                    result = res;
            }).finally(function () {
                    expect(result).toBeDefined();
                    expect(result.data.auth_token).toBeDefined();
                    expect(typeof result.data).toEqual('object');
                    expect(result.data).toBeDefined();
            }).catch(function () {this.fail('exception should not occur here!'); }.bind(this));
            $rootScope.$apply();
        });


        it('should be able to login when session lost', function () {
            var result;
            WS.failForNextRequestWithCode(5);
            Zergling.login({username: 'u', password: 'p'}).then(function (res) {
                result = res;
            }).finally(function () {
                    expect(result).toBeDefined();
                    expect(typeof result.data).toEqual('object');
                    expect(result.data).toBeDefined();
             }).catch(function () {this.fail('exception should not occur here!'); }.bind(this));
            $rootScope.$apply();

        });


        it('should fail when not getting session id', function () {
            var result;
            WS.invalidSessionRespForNextRequest = true;
            Zergling.get({'source': 'betting', 'what': {'sport': []}, 'where': {'game': {'type': 1}}})
                .then(function (res) {result = res; })
                .finally(function () {
                    expect(result).toBeUndefined();
                });
            $rootScope.$apply();
        });

    });


    describe('Zergling using long-polling', function () {
        beforeEach(function () {
//            $httpBackend.resetExpectations();
            WS.isAvailable = false; //to use long polling
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should be able to subscribe', function () {

            $httpBackend.expect('POST', 'http://test/', function (data) {return JSON.parse(data).command === 'request_session'; })
                        .respond({code: 0, data: {sid: "a31c70ae-5113-11e3-8000-08606ed77687"}});
            $httpBackend.expect('POST', 'http://test/', function (data) {return JSON.parse(data).command === 'get' && JSON.parse(data).params.subscribe; })
                        .respond({code: 0, "data": {"subid": "8187027007754353648", "data": {"sport": {"846": {"alias": "IceHockey", "name_id": 49, "name": "Ice Hockey", "id": 846}, "844": {"alias": "Soccer", "name_id": 4, "name": "Soccer", "id": 844}, "850": {"alias": "Basketball", "name_id": 1978, "name": "Basketball", "id": 850}, "852": {"alias": "Volleyball", "name_id": 2613, "name": "Volleyball", "id": 852}, "848": {"alias": "Tennis", "name_id": 1591, "name": "Tennis", "id": 848}}}}});
            var result;
            Zergling.subscribe({'source': 'betting', 'what': {'sport': []}, 'where': {'game': {'type': 1}}}, function (data) {
                console.log('subscribtion callback:', data);
            }).then(function (res) { result = res; })
              .finally(function () {
                    expect(result).toBeDefined();
                    expect(typeof result.subid).toEqual('string');
                    expect(result.data).toBeDefined();
                })
              .catch(function () {this.fail('exception should not occur here!'); }.bind(this));
            $httpBackend.flush();

        });

        it('should be able to unsubscribe', function () {
            $httpBackend.expect('POST', 'http://test/', function (data) {return JSON.parse(data).command === 'request_session'; })
                        .respond({code: 0, data: {sid: "a31c70ae-5113-11e3-8000-08606ed77687"}});
            $httpBackend.expect('POST', 'http://test/', function (data) {return JSON.parse(data).command === 'unsubscribe';  })
                        .respond({code: 0, "data": {"subid": "8187027007754353648", "data": {"sport": {"846": {"alias": "IceHockey", "name_id": 49, "name": "Ice Hockey", "id": 846}, "844": {"alias": "Soccer", "name_id": 4, "name": "Soccer", "id": 844}, "850": {"alias": "Basketball", "name_id": 1978, "name": "Basketball", "id": 850}, "852": {"alias": "Volleyball", "name_id": 2613, "name": "Volleyball", "id": 852}, "848": {"alias": "Tennis", "name_id": 1591, "name": "Tennis", "id": 848}}}}});
            var result;
            Zergling.unsubscribe('subscription_id', function (data) {
                console.log('unsubscribtion callback:', data);
            }).then(function (response) {
                    return result = response;
                }).finally(function () {
                    expect(result).toBeDefined();
                    expect(result.data.code).toEqual(0);
                }).catch(function () {this.fail('exception should not occur here!'); }.bind(this));
            $httpBackend.flush();

        });


        it('should be able to get', function () {
            $httpBackend.expect('POST', 'http://test/', function (data) {return JSON.parse(data).command === 'request_session'; })
                        .respond({code: 0, data: {sid: "a31c70ae-5113-11e3-8000-08606ed77687"}});
            $httpBackend.expect('POST', 'http://test/', function (data) {return JSON.parse(data).command === 'get' && JSON.parse(data).params.subscribe === undefined; })
                        .respond({code: 0, "data": {"subid": "8187027007754353648", "data": {"sport": {"846": {"alias": "IceHockey", "name_id": 49, "name": "Ice Hockey", "id": 846}, "844": {"alias": "Soccer", "name_id": 4, "name": "Soccer", "id": 844}, "850": {"alias": "Basketball", "name_id": 1978, "name": "Basketball", "id": 850}, "852": {"alias": "Volleyball", "name_id": 2613, "name": "Volleyball", "id": 852}, "848": {"alias": "Tennis", "name_id": 1591, "name": "Tennis", "id": 848}}}}});
            var result;
            Zergling.get({'source': 'betting', 'what': {'sport': []}, 'where': {'game': {'type': 1}}})
                .then(function (res) { result = res; })
                .finally(function () {
                    expect(result).toBeDefined();
                    expect(typeof result.subid).toEqual('string');
                    expect(result.data).toBeDefined();
                })
                .catch(function () {this.fail('exception should not occur here!'); }.bind(this));
            $httpBackend.flush();
        });


        it('should be able to login', function () {
            $httpBackend.expect('POST', 'http://test/', function (data) { return JSON.parse(data).command === 'request_session'; })
                        .respond({code: 0, data: {sid: "a31c70ae-5113-11e3-8000-08606ed77687"}});
            $httpBackend.expect('POST', 'http://test/', function (data) {return JSON.parse(data).command === 'login' && JSON.parse(data).params.username === 'u' && JSON.parse(data).params.password === 'p'; })
                        .respond({code: 0, data: {auth_token: 'aaa'} });
            var result;
            Zergling.login({username: 'u', password: 'p'}).then(function (res) {
                result = res;
            }).finally(function () {
                    expect(result).toBeDefined();
                    expect(result.data.auth_token).toBeDefined();
                    expect(typeof result.data).toEqual('object');
                    expect(result.data).toBeDefined();
            }).catch(function () {this.fail('exception should not occur here!'); }.bind(this));
            $httpBackend.flush();
        });


        it('should be able to get new session when it is lost', function () {

            $httpBackend.expect('POST', 'http://test/', function (data) { return JSON.parse(data).command === 'request_session'; })
                .respond({code: 0, data: {sid: "a31c70ae-5113-11e3-8000-08606ed77687"}});
            $httpBackend.expect('POST', 'http://test/', function () { return true; }).respond({code: 5});
            $httpBackend.expect('POST', 'http://test/', function (data) { return JSON.parse(data).command === 'request_session'; })
                .respond({code: 0, data: {sid: "a31c70ae-5113-11e3-8000-08606ed77687"}});
            $httpBackend.expect('POST', 'http://test/', function (data) { console.log(data); return true; })
                .respond({code: 0, data: {auth_token: 'aaa'} });
            var result;
            Zergling.login({username: 'u', password: 'p'}).then(function (res) {
                result = res;
            }).finally(function () {
                    expect(result).toBeDefined();
                    expect(result.data.auth_token).toBeDefined();
                    expect(typeof result.data).toEqual('object');
                    expect(result.data).toBeDefined();
                }).catch(function () {this.fail('exception should not occur here!'); }.bind(this));
            $httpBackend.flush();
        });
    });


});