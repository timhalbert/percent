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

    function shuffle(array) {
        let counter = array.length;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            let index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
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
    }

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
