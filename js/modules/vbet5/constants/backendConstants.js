/**
 * @ngdoc property
 * @name vbet5.constant:backend Constants
 * @description Add here known constants and types that was used in backend
 */

angular.module('vbet5').constant('BackendConstants', (function () {
    var constants =  {
        PromotionalBonus: {
            BonusType: {
                SportBonus: 1,
                WageringBonus: 2,
                NoDepositBonus: 3,
                CashBonus: 4,
                FreeSpin: 5,
                FreeBet: 6
            },
            TriggerType: {
                Deposit: 1
            },
            BonusAcceptanceType: {
                None: 0,
                Accepted: 1,
                Activated: 2,
                Rejected: 3,
                Expired: 4
            },
            BonusResultType: {
                None: 0,
                Paid: 1,
                Lost: 2,
                Canceled: 3,
                Expired: 4
            },
            BonusSource: {
                SportsBook: 1,
                Casino: 2,
                CasinoFreeSpins: 0,
                BonusRequest: 3,
                BonusHistory: 4,
                ReferToFriend: 5
            }
        },
        ErrorCodes: {
            'Client Has Active Bonus': 99,
            'InternalError': 1000,
            'InvalidUsernamePassword': 1002,
            'clientNotFound': 1002,
            'UserBlocked': 1003,
            'PartnerApiUserDismissed': 1004,
            'IncorrectOldPassword': 1002,
            'DuplicateLogin': 1118,
            'DuplicateEmail': 1119,
            'DuplicateNickName': 1120,
            'DuplicateRootNode': 1121,
            'DuplicatePersonalId': 1122,
            'DuplicateDocNumber': 1123,
            "AccountNotFound": 2000,
            "ArgumentError": 2001,
            "BetshopNotFound": 2002,
            "BetStateError": 2003,
            "CanNotDeleteNodeWithChildren": 2004,
            "CashDeskNotFound": 2005,
            "CashDeskNotRegistered": 2006,
            "CurrencyMismatch": 2007,
            "ClientExcluded": 2008,
            "ClientLocked": 2009,
            "ClientBetStakeLimitError": 2200,
            "DbEntityValidationException": 2011,
            "DbUpdateConcurrencyException": 2012,
            "DocumentAlreadyInitialized": 2013,
            "DocumentInvalidAction": 2014,
            "DocumentNotInitialized": 2015,
            "DocumentNotFound": 2016,
            "DocumentTypeError": 2017,
            "EmailShouldNotBeEmpty": 2018,
            "ExpiredResetCode": 2019,
            "FirstNameShouldNotBeEmpty": 2020,
            "GameAlreadyExisits": 2021,
            "GameNotExist": 2022,
            "IncorrectRequest": 2023,
            "InvalidEmail": 2024,
            "InvalidFilter": 2025,
            "InvalidNodeId": 2026,
            "InvalidTreeId": 2027,
            "InvalidPaymentSystem": 2028,
            "InputValuesMismatch": 2029,
            "IsLiveFlagMismatch": 2030,
            "LastNameShouldNotBeEmpty": 2031,
            "MatchAccessError": 2032,
            "MarketSuspended": 2033,
            "MatchNotFound": 2034,
            "MatchStateNotFound": 2035,
            "MatchSuspended": 2036,
            "MaxDailyBetAmountError": 2037,
            "MaxSingleBetAmountError": 2038,
            "MaxDepositRequestSum": 2038,
            "MinDepositRequestSum": 2039,
            "MaxWithdrawalRequestsCount": 2040,
            "MaxWithdrawalRequestSum": 2041,
            "MarketTypeGroupNotFound": 2042,
            "MinWithdrawalRequestSum": 2043,
            "NodeWithGivenTypeAndSequenceAlreadyExists": 2044,
            "NoRootNodeInSportResultTemplate": 2045,
            "NotAllowed": 2046,
            "NotAuthorized": 2047,
            "WrongRegion": 3001,
            "NickNameAlreadySet": 2049,
            "OneMarketTypeGroup": 2050,
            "PartnerApiAccNotActivated": 2051,
            "PartnerApiClientBalanceError": 2052,
            "PartnerApiClientLimitError": 2053,
            "PartnerApiEmptyMethod": 2054,
            "PartnerApiEmptyRequestBody": 2055,
            "PartnerApiMaxAllowableLimit": 2056,
            "PartnerApiMinAllowableLimit": 2057,
            "PartnerApiPassTokenError": 2058,
            "PartnerApiTimeStampExpired": 2059,
            "PartnerApiTokenExpired": 2060,
            "PartnerApiUserBlocked": 2061,
            "PartnerApiWrongHash": 2062,
            "PartnerApiWrongLoginEmail": 2063,
            "PartnerApiWrongAccess": 2064,
            "PartnerNotFound": 2065,
            "PartnerCommercialFeeNotFound": 2066,
            "PasswordShouldBeDifferent": 2067,
            "PermissionNotFound": 2068,
            "RegionNotFound": 2069,
            "RequestNotAllowed": 2070,
            "RequestStateError": 2071,
            "ResetCodeExpaired": 2072,
            "RoleNotFound": 2073,
            "SamePasswordAndLogin": 2074,
            "SelectionNotFound": 2075,
            "SelectionsCountMismatch": 2076,
            "SelectionSuspended": 2077,
            "SportMismatch": 2078,
            "ShiftDoesNotExists": 2079,
            "SportNotSupported": 2080,
            "TeamAlreadyExists": 2081,
            "TransactionAlreadyExists": 2082,
            "TransactionAlreadyOpen": 2083,
            "TransactionAmountError": 2084,
            "TranslationAlreadyExists": 2085,
            "TranslationNotFound": 2086,
//             "UserBlocked": 2087,
            "UserPasswordMustBeLonger": 2088,
            "UserPasswordRegExpNotValid": 2089,
            "OperationAlreadyProcessed": 2090,
            "PasswordExpired": 2091,
            "UserWasNotFound": 2092,
            "UserNameAlreadyExist": 2093,
            "MatchStartTimeHasPassed": 2094,
            "WithdrawalRequestDocumentNotFound": 2095,
            "WrongClientToken": 1002,
            "WrongClassifierGrouopId": 2097,
            "WrongCurrencyCode": 2098,
            "WrongInputParameters": 2099,
            "InvalidClientBonus": 2412,
            "BonusEngineError": 2445,
            "WrongLoginAttempts": 3000,
            "NotSupportedCurrency": 3001,
            "WrongOldPassword": 3002,
            "WrongTransactionId": 3003,
            "InvalidToken": 3004,
            "TokenAlreadyExists": 3005,
            "InvalidPaymentSystemOperation": 3006,
            "InvalidPaymentSystemCommission": 3007,
            "ImageUploadFailed": 3008,
            "IncorrectClientRequest": 3009,
            "BetSelectionChanged": 1800,
            "IsNotAnImage": 3011,
            "CantCreateDirectory": 3012,
            "InvalidAgent": 3013,
            "InvalidAgentSystem": 3014,
            "NegativeAmount": 3015,
            "WrongAgentGroup": 3016,
            "WrongAgentGroupValue": 3017,
            "InvalidAgentGroupItem": 3018,
            "BetSelectionsCombindedError": 3019,
            "PendingWithdrawalRequests": 2403,
            "CashOutNotAllowed": 2404,
            "BonusNotFound": 2405,
            "PartnerBonusNotFound": 2406,
            "ClientHasActiveBonus": 2407,
            "ClientHasAcceptedBonus": 2420

        }
    };

   function generateReverseLookupConstants(sourceObj) {
       var tempObj = {};
       var isLeaf = false;
       var result = null;
       angular.forEach (sourceObj, function (val, key) {
            if (typeof (val) === 'string' || typeof (val) === 'number') {
                tempObj[val] = key;
                isLeaf = true;
            } else {
                if ((result = generateReverseLookupConstants(val)) !== null) {
                    sourceObj[key + 'ByValue'] = result;
                }
            }
        });
       if (isLeaf) {
           return tempObj
       } else {
           return null;
       }

    }
    generateReverseLookupConstants(constants);

    return constants;
})());
