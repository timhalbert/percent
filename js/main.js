$(document).ready(function() {
    var $grid = $('#grid');

    _.times(25, function() {
        $grid.append('<div class="square"><div class="in-square"></div></div>');
    });

    var currentLevel = 1;
    var $$squares = $('.square');
    var $$in = $('.in-square');

    function square(ix) {
        return $$squares.eq(ix);
    }

    function onSquare(ix, fn) {
        var $square = square(ix).click(function() {
            var $pulse = $('<div class="square-click-pulse"/>').appendTo($square);
            setTimeout(function() { $pulse && $pulse.remove(); }, 500);
            fn();
        });
    }

    function roll(ix) {
        return Math.random()*100 < square(ix).data('pct');
    }

    function fillSquare(ix, pct, text) {
        $$in.eq(ix).html(
            '<span class="pct">' +
                '<span class="value">' + pct + '</span>' +
                '<span class="unit">%</span>' +
            '</span>' +
            '<div>' + text.replace('NL', 'Level ' + (currentLevel+1)) + '</div>'
        );
        $$squares.eq(ix).data({pct: pct}).toggleClass('active', true);
    }

    function makeLevel(n) {
        $$squares.off('click').toggleClass('active', false);
        $$squares.find('.square-click-pulse').remove();
        $$in.empty();
        $lsLevels.find('.ls-level').toggleClass('current', false).eq(n-1).addClass('current');

        document.title = 'Level ' + n;
        currentLevel = n;
        var next = n+1;

        if (n === 1) {
            fillSquare(12, 100, 'chance of proceeding to NL');
            onSquare(12, function() { makeLevel(2); });
        }
        else if (n === 2) {
            fillSquare(11, 0, 'chance of proceeding to NL');
            onSquare(11, function() { if (roll(11)) makeLevel(3); });
            fillSquare(13, 100, 'chance of increasing other square\'s chance to 100%');
            onSquare(13, function() { fillSquare(11, 100, 'chance of proceeding to NL'); });
        }
        else if (n === 3) {
            var firstText = 'chance of adding 10% to chance on the right';
            var second = 0, secondText = 'chance of adding 10% to chance below';
            var third = 0, thirdText = 'chance of adding 10% to chance on the left';
            var fourth = 0, fourthText = 'chance of proceeding to NL';
            fillSquare(6, 10, firstText);
            fillSquare(8, 0, secondText);
            fillSquare(18, 0, thirdText);
            fillSquare(16, 0, fourthText);
            onSquare(6, function() {
                if (roll(6)) { second = Math.min(100, second+10); fillSquare(8, second, secondText); }
            });
            onSquare(8, function() {
                if (roll(8)) { third = Math.min(100, third+10); fillSquare(18, third, thirdText); }
            });
            onSquare(18, function() {
                if (roll(18)) { fourth = Math.min(100, fourth+10); fillSquare(16, fourth, fourthText); }
            });
            onSquare(16, function() {
                if (roll(16)) makeLevel(4);
            });
        }
        else if (n === 4) {
            var shuffleText = 'chance of shuffling the 9 centre squares';
            var productText = 'chance of inserting rounded product of all chances to the left to chance below';
            var nlChance = 0, nlText = 'chance of proceeding to NL';
            var centrePositions = [6, 7, 8, 11, 12, 13, 16, 17, 18];
            var centreArray = [90, 10, 90, 10, 10, 10, 10, 90, 10];

            fillSquare(0, 100, shuffleText);
            fillSquare(14, 100, productText);
            fillSquare(24, 0, nlText);
            _.each(centrePositions, function(sq, ix) {
                fillSquare(sq, centreArray[ix], '');
            });

            onSquare(0, function() {
                centreArray = _.shuffle(centreArray);
                _.each(centrePositions, function(sq, ix) {
                    fillSquare(sq, centreArray[ix], '');
                });
            });
            onSquare(14, function() { 
                nlChance = Math.round(centreArray[3]*centreArray[4]*centreArray[5]/10000);
                fillSquare(24, nlChance, nlText);
            });
            onSquare(24, function() {
                if (roll(24)) makeLevel(5);
            });
        }
        else if (n === 5) {
            var text = 'chance of reducing, rather than increasing, my value by 10%';
            var first = 50, second = 50, third = 50;
            var nlText = 'chance of proceeding to NL if the preceding chances are (20%, 50%, 80%) in any order';

            var s = [6, 8, 16];

            fillSquare(6, first, text);
            fillSquare(8, second, text);
            fillSquare(16, third, text);
            fillSquare(18, 100, nlText);

            onSquare(6, function () {
                first += roll(6)?-10:10;
                fillSquare(6, first, text);
            });
            onSquare(8, function () {
                second += roll(8)?-10:10;
                fillSquare(8, second, text);
            });
            onSquare(16, function () {
                third += roll(16)?-10:10;
                fillSquare(16, third, text);
            });
            onSquare(18, function () {
                if (_.isEqual([first, second, third].sort(), [20, 50, 80])) {
                    makeLevel(6);
                }
            });
        }
	else if (n === 6) {
            var hideShuffleText = 'chance of hiding and shuffling the above three squares '
                'and adding 100% to every chance on the grid';
            var firstClick = true;

            var resetText = 'chance of resetting the level';
            var proceedText = 'chance of proceeding to NL';

            var montyHallDoors = [  // [text, level to load]
                [resetText, n],
                [proceedText, n+1],
                [resetText, n]
            ];
            var doorPositions = [11, 12, 13];

            var controllerText = 'chance of revealing a reset button NOT below this box';
            var controllerPositions = [6, 7, 8];

            var frozen = false;  // Prevents any further clicks on doors

            fillSquare(17, 100, hideShuffleText);
            _.each(controllerPositions, function (sq, ix) {
                fillSquare(sq, 0, controllerText);
            });
            _.each(doorPositions, function (sq, ix) {
                fillSquare(sq, 0, montyHallDoors[ix][0]);
            });

            onSquare(17, function () {
                if (!firstClick) { return; }

                firstClick = false;
                fillSquare(17, 0, hideShuffleText);

                _.each(controllerPositions, function (sq, ix) {
                    fillSquare(sq, 100, controllerText);
                });

                doorPositions = _.shuffle(doorPositions);
                _.each(doorPositions, function (sq, ix) {
                    fillSquare(sq, 100, '???');
                    onSquare(sq, function () {
                        if (roll(sq) && !frozen) { 
                            frozen = true;
                            fillSquare(sq, 100, montyHallDoors[ix][0]);
                            setTimeout(function () {
                                makeLevel(montyHallDoors[ix][1]); 
                            }, 300);
                        }
                    });
                });
            });

            _.each(controllerPositions, function (sq, ix) {
                onSquare(sq, function () {
                    if (roll(sq)) {
                        var toReveal = (sq + 5 === doorPositions[0]) ? 
                            doorPositions[2] : doorPositions[0];
                        fillSquare(toReveal, 100, resetText);

                        _.each(controllerPositions, function (sq, ix) {
                            fillSquare(sq, 0, controllerText);
                        });
                    }
                });
            });
        }
    }

    // Level selector

    var numLevels = 6;
    var $lsLevels = $('#level-selector').find('#ls-levels');
    _.times(30, function(n) {
        $lsLevels.append($('<div class="ls-level">' + (n+1) + '</div>').click(function(e) {
            var $target = $(e.delegateTarget);
            if ($target.hasClass('disabled')) return;
            makeLevel(n+1);
        }).toggleClass('disabled', n >= numLevels));
    });

    // Start

    makeLevel(currentLevel);

    // Pretty

    setInterval(function() {
        var duration = 10e3 + (Math.random()*10e3);
        var left1 = 0, top1 = 0, left2 = 0, top2 = 0;
        while (left1 >= -5 && left1 <= 105 && top1 >= -5 && top1 <= 105) {
            left1 = -200 + Math.random() * 400;
            top1 = -200 + Math.random() * 400;
        }
        while (left2 >= -5 && left2 <= 105 && top2 >= -5 && top2 <= 105) {
            left2 = -200 + Math.random() * 400;
            top2 = -200 + Math.random() * 400;
        }

        var $flyingPct = $('<div class="flying-pct">%</div>').css({
            'font-size': (0.5 + Math.random()*2.5) + 'em',
            'transform': 'rotate(' + Math.random()*1440 + 'deg)',
            left: left1 + '%',
            top: top1 + '%'
        }).animate({
            left: left2 + '%',
            top: top2 + '%'
        }, {
            duration: duration
        }).appendTo('body');

        setTimeout(function() {
            $flyingPct.remove();
        }, duration);
    }, 500);
});
