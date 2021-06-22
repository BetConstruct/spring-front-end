VBET5.service('tournamentFilter', function (){

    this.filterData = function filterData(data, tournament) {
        if (!tournament) {
            return data;
        }
        var result = {sport: {}};
        var intialSports = data.sport;
        var sportRuleMap = tournament.sportRuleMap;
        tournament.sportIds.forEach(function (sportId) {
            var sport = intialSports[sportId];
            if (sport ){
                var resultSport = {
                    id: sport.id,
                    name: sport.name,
                    alias: sport.alias,
                    order: sport.order
                };
                if (sportRuleMap[sportId].all) {
                    result.sport[sportId] = angular.copy(sport);
                } else {
                    angular.forEach(sport.region, function (region, regionId){
                        var resultRegion = {
                            id: region.id,
                            name: region.name,
                            alias: region.alias,
                            order: region.order
                        };
                        angular.forEach(region.competition, function (competition, competitionId) {
                           if (sportRuleMap[sportId][competitionId]) {
                               result.sport[sportId] =  result.sport[sportId] || resultSport;
                               result.sport[sportId].region =   result.sport[sportId].region || {};
                               result.sport[sportId].region[regionId] =   result.sport[sportId].region[regionId] || resultRegion;
                               result.sport[sportId].region[regionId].competition =  result.sport[sportId].region[regionId].competition || {};
                               result.sport[sportId].region[regionId].competition[competitionId] = angular.copy(competition);

                           }
                        });
                    });
                }

            }
        });
        return result;

    };
})