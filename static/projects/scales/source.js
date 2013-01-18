/**
 * todo:
 * add tones an octave above, but do not make them the tonic
 * why? to sound good if chosen last.
 */

$.fn.extend({
    // From http://krazydad.com/tutorials/makecolors.php
    hslToColor: function(h, s, l) {
        return 'hsla(' + h + ',' + s + '%,' + l + '%, 0.7)';
    },

    getColorRainbow: function(size) {
        var limit = 360; // degrees of HSL values
        var cycle = limit/(size);
        var saturation = 80, light = 50;
        var colors = [];

        for (var i = 0; i < size; i++) {
            colors.push($.fn.hslToColor(Math.floor(cycle * i), saturation, light));
        }
        return colors;
    },

    capitalize : function(string) {
        return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
    },

    resetView: function() {
        $.fn.clearScale();
        $('.message').hide();
        $('#scale').hide();
        $('#current').html('');
        $('#scales').html('');
        $('#kill').attr('disabled', 'disabled');
        $('#yeah').hide();
        $('.note-name').removeClass('pressed');
    },

    highlightScaleName: function(element) {
        $('a.key-name').css('font-weight', 'normal');
        $(element).css('font-weight', 'bold');
    },

    clearScale: function() {
        if ($('#scale').is(':visible')) {
            Staff.clear();
            Staff.draw();
        }
    },

    drawScale: function(keyName, notes) {
        Staff.renderKeySignature(keyName, notes);
        Staff.render('scale', keyName, notes);
        $('#scale').show();
    }
});

var trollBeat = new buzz.sound('files/156370__thecluegeek__techno-beat.wav', { loop: true });
var yeahEffect = new buzz.sound('files/86099__donthemagicwon__yeah.wav', { loop: false });

var Scale = function(cycle, root, subtype, type) {
    this.root = root;
    this.type = type;
    this.subtype = subtype || "";
    this.scale = this.generate(cycle, (subtype + type), root);
    return this;
};
Scale.prototype.getFullName = function() {
    return this.root + " " + ((this.subtype.length > 0) ? this.subtype + " " : "") + this.type;
};
Scale.prototype.collapse = function () {
    return this;
};
// from http://www.thecipher.com/chord-progressions-minor.html
Scale.prototype.generate = function(cycle, type, root) {
    var scale = [];
    var intervals = {
        major: [0, 2, 4, 5, 7, 9, 11],
        naturalminor: [0, 2, 3, 5, 7, 8, 10],
        harmonicminor: [0, 2, 3, 5, 7, 8, 11],
        melodicminor: [0, 2, 3, 5, 7, 9, 11]
    };
    for (var i = 0; i < 7; i++) {
        scale[i] = cycle.getAtInterval(root, intervals[type][i]);
    }
    return scale;
};

Staff = (function() {
    var tonicY = { // octave 3
        'a': 45,
        'b': 38,
        'c': 80,
        'd': 73,
        'e': 66,
        'f': 59,
        'g': 52
    };

    var staff = {};

    staff.getKeySignature = function(name) {
        var keySignatures = {
            'a harmonic minor': ['♯', 1],
            'e natural minor': ['♯', 1],
            'a melodic minor': ['♯', 1],
            'g major': ['♯', 1],
            'b natural minor': ['♯', 2],
            'd major': ['♯', 2],
            'e harmonic minor': ['♯', 1],
            'a major': ['♯', 3],
            'b harmonic minor': ['♯', 3],
            'e melodic minor': ['♯', 3],
            'f-sharp natural minor': ['♯', 3],
            'b melodic minor': ['♯', 2],
            'f-sharp harmonic minor': ['♯', 4],
            'b major': ['♯', 5],
            'f-sharp melodic minor': ['♯', 5],
            'e major': ['♯', 4],
            'f-sharp major': ['♯', 6],
            'c melodic minor': ['♭', 1],
            'd melodic minor': ['♭', 1],
            'd natural minor': ['♭', 1],
            'f major': ['♭', 1],
            'c harmonic minor': ['♭', 2],
            'b-flat major': ['♭', 2],
            'f melodic minor': ['♭', 2],
            'g natural minor': ['♭', 2],
            'g harmonic minor': ['♭', 2], // Also has one sharp. *
            'b-flat melodic minor': ['♭', 3],
            'c natural minor': ['♭', 3],
            'e-flat major': ['♭', 3],
            'f harmonic minor': ['♭', 3],
            'a-flat major': ['♭', 4],
            'b-flat harmonic minor': ['♭', 4],
            'e-flat melodic minor': ['♭', 4],
            'f natural minor': ['♭', 4],
            'e-flat harmonic minor': ['♭', 5],
            'b-flat natural minor': ['♭', 5],
            'd-flat major': ['♭', 5],
            'a-flat melodic minor': ['♭', 5],
            'd-flat harmonic minor': ['♭', 6],
            'd-flat melodic minor': ['♭', 6],
            'a-flat harmonic minor': ['♭', 6],
            'e-flat natural minor': ['♭', 6],
            'd-flat natural minor': ['♭', 7],
            'a-flat natural minor': ['♭', 7]

            // b melodic minor has extra sharps at 6 and 7 *
            // 'g melodic minor' has one flat and one sharp. *
            // d harmonic minor has one flat and one sharp. *
            // c#/db is just weird. special case.
        };
        return keySignatures[name] || [];
    };

    return {
        draw: function() {
            var clef = new Image();

            clef.onload = function() {
                var lineScale = 14;
                var vOffset = 20;
                var ctx = staff.ctx;

                for (var i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(0, i * lineScale + vOffset);
                    ctx.lineTo(staff.element.width, i * lineScale + vOffset);
                    ctx.stroke();
                    ctx.closePath();
                }

                var scaling = Staff.scaleVector(clef, 35);
                ctx.drawImage(clef, 0, 8, scaling.width, scaling.height);
            };
            clef.src = 'svg/g_clef.svg';
        },
        render: function(id, name, scale) {
            var ctx = staff.ctx;
            var whole = new Image();
            var xOrigin = 50; // pixels from edge of canvas
            var xSpacing = 32;
            var ySpacing = 7;
            var tonic = _.first(scale[0]);

            function drawAccidental(accidental, count, y, doubled) {
                ctx.fillText(accidental, xOrigin + (count * xSpacing) - 15, y + 14, 20);
                if (doubled) {
                    ctx.fillText(accidental, xOrigin + (count * xSpacing) - 8, y + 14, 20);
                }
            }

            // add a little bit to xOffset to deal with large key signatures
            var signature = staff.getKeySignature(name);
            if (signature.length) {
                xOrigin += 7 * signature[1];
            }

            window.console.log(scale);
            whole.onload = function() {
                var noteSize = Staff.scaleVector(whole, 20);
                var y;

                _.each(scale, function(el, count) {
                    var context = this;
                    var natural = _.first(el);
                    y = tonicY[tonic] - (ySpacing * count);

                    if (natural == 'c' && count == 0) {
                        Staff.drawLine(xOrigin - 5, 90, xOrigin + 25, 90);
                    }

                    if (['b', 'a'].indexOf(natural) > -1 && count == 6 && y < 30) {
                        Staff.drawLine(xOrigin + ((count * xSpacing) - 5), 6, xOrigin + ((count * xSpacing) + 25), 6);
                    }

                    // G harmonic minor
                    if (count == 6 && name == 'g harmonic minor') {
                        drawAccidental('♯', count, y);
                    }

                    if (name == 'd harmonic minor') {
                        if (count == 5) {
                            drawAccidental('♭', count, y);
                        }
                        if (count == 6) {
                            drawAccidental('♯', count, y);
                        }
                    }

                    if (name == 'b melodic minor' && [5, 6].indexOf(count) > -1) {
                        drawAccidental('♯', count, y);
                    }

                    if (name == 'e harmonic minor' && count == 6) {
                        drawAccidental('♯', count, y);
                    }

                    if (name == 'd-flat natural minor' && count == 6) {
                        drawAccidental('♭', count, y, true);
                    }

                    if (name == 'd-flat harmonic minor') {
                        if (count == 5) {
                            drawAccidental('♭', count, y, true);
                        }
                        if (count == 6) {
                            drawAccidental('♮', count, y);
                        }
                    }

                    if (name == 'd-flat melodic minor') {
                        if (count == 6) {
                            drawAccidental('♮', count, y);
                        }
                    }

                    if (name == 'd melodic minor') {
                        if (count == 5) {
                            drawAccidental('♮', count, y);
                        }
                        if (count == 6) {
                            drawAccidental('♯', count, y);
                        }
                    }

                    ctx.drawImage(whole, xOrigin + (count * xSpacing), y, noteSize.width, noteSize.height);
                });
            };
            whole.src = 'svg/whole_note.svg';e
        },

        // To draw notes in tonic order,
        scaleVector: function(img, width) {
            // Get scaling for an svg image based on a desired width
            var aspect = (img.height / img.width);

            return {
                width: width,
                height: width * aspect
            };
        },
        drawLine: function(x1, y1, x2, y2, color) {
            var ctx = staff.ctx;
            ctx.beginPath();
            ctx.strokeStyle = (color) ? color : 'black';
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.closePath(); // god damn it, drawing a line is annoying
        },
        renderKeySignature: function(keyName, scale) {
            var ctx = staff.ctx,
                exes = [],
                whys = [];
            for (var i = 0; i < 7; i++) {
                exes[i] = 35 + (i * 8);
            }

            ctx.font = "18px sans-serif";
            var sig = staff.getKeySignature(keyName);
            if (sig.length) {
                // draw sharps
                if (sig[0] == '♯') {
                    whys = [26, 48, 19, 41, 62, 34, 0];
                } else { // flats, then
                    whys = [52, 30, 59, 38, 66, 45, 73];
                }

                for (var i = 0; i < sig[1]; i++) {
                    ctx.fillText(sig[0], exes[i], whys[i], 20);
                }
            }
        },
        init: function(id) {
            staff.element = document.getElementById(id);
            staff.ctx = staff.element.getContext('2d');
        },
        clear: function() {
            staff.ctx.clearRect(0, 0, staff.element.width, staff.element.height);
        }
    }
})();
Cycle = (function() {
    var cycle = {};

    cycle.drawScale = function(keyName) {
        $.fn.clearScale();
        $.fn.drawScale(keyName, this.scales[keyName]);
    };

    cycle.getAtInterval = function(root, interval) {
        var keys = _.keys(cycle.toneMap),
            index = keys.indexOf(root);

        if (index == -1) {
            throw "Unknown chromatic root";
        }

        if (interval > keys.length) {
            interval = keys.length % interval;
        }

        if (interval < 0 && index == 0) {
            keys = keys.reverse();
            return keys[Math.abs(interval) - 1];
        }

        if (interval + index > keys.length - 1) {
            interval -= keys.length - index;
            return keys[interval];
        }
        return keys[index + interval];
    };

    cycle.toneMap = {
        'c': 'c',
        'd-flat': 'c♯',
        'd': 'd',
        'e-flat': 'e♭',
        'e': 'e',
        'f': 'f',
        'f-sharp' : 'f♯',
        'g': 'g',
        'a-flat': 'a♭',
        'a': 'a',
        'b-flat': 'b♭',
        'b': 'b'
    };

    cycle.scales = {
    };

    // Initialize Cycle.toneMap and the scales
    $.each(cycle.toneMap, function(el, i) {
        var symbol = cycle.toneMap[el];
        cycle.toneMap[el] = {
            symbol: symbol,
            isPlaying: false,
            inScales: {}
        };
    });

    $.each(cycle.toneMap, function(element, i) {
        var pathTo = 'files/' + element + '.wav';
        $.ajax({
            type: 'GET',
            url: pathTo,
            success: function() {
                cycle.toneMap[element].sound = new buzz.sound(pathTo, { loop: false });

                // Init scales.
                var major = new Scale(cycle, element, "", "major");
                cycle.associate(major);

                var naturalMinor = new Scale(cycle, element, "natural", "minor");
                cycle.associate(naturalMinor);

                var harmonicMinor = new Scale(cycle, element, "harmonic", "minor");
                cycle.associate(harmonicMinor);

                var melodicMinor = new Scale(cycle, element, "melodic", "minor");
                cycle.associate(melodicMinor);
            },
            error: function(jqxhr) {
                console.log("Couldn't load file:", jqxhr);
            }
        });
    });

    cycle.associate = function(myScale) {
        var name = myScale.getFullName();
        cycle.scales[name] = myScale.scale; // Set the scale in cycle.scales

        // Set the relationships that this scale has with all the scale roots
        $.each(myScale.scale, function(i, el) {
            cycle.toneMap[el].inScales[name] = name;
        });
    };

    cycle.doRender = function() {
        var searchResults = cycle.searchForScales();
        var scales;

        $('#current').text(searchResults.playing.join(', '));
        if (searchResults.playing.length > 0) {
            $('#kill').removeAttr('disabled');
        } else {
            $('#kill').attr('disabled', 'disabled');
            $('#scales').html('');
        }

        if (searchResults.playing.length == _.keys(cycle.toneMap).length) {
            $('.message').hide();
            trollBeat.play();
            $('.troll').show();
            $('#yeah').show();
        } else if (searchResults.playing.length > 0 && searchResults.related.length == 0) {
            // if in beat experiment mode, let it keep going
            if (!$('.troll').is(':visible')) {
                $('.none').show();
                $('.memberships').hide();
                $('#yeah').hide();
                $('.troll').hide();
                $('#scales').hide();
            }

            $.fn.clearScale();
            $('#scale').hide();
        } else {
            $('.message').hide();
            if (searchResults.playing.length > 2) {
                var scales = '<ul>';
                $.each(searchResults.related, function(index, e) {
                    scales += '<li><a href="#" class="key-name" data-key-name="' + e + '">' + $.fn.capitalize(e) + '</a></li>';
                });
                scales += '</ul>';
                $('.memberships').show();
                $('#scales').html(scales).show();
            }
        }
    };

    cycle.toLoop = {};

    cycle.isLooping = false;
    cycle.loop = function() {
        var notes = Object.keys(cycle.toLoop).sort();
        if (notes.length) {
            cycle.isLooping = true;
            var delay = 234; // ms; each short sound is 250ms
            for (var i = 0; i < notes.length; i++) {
                var player = ( function(noteName) {
                    return function() {
                        cycle.toneMap[noteName].sound.play();
                        $('#' + noteName).addClass("bounce");
                    }
                } )( notes[i] );
                setTimeout(player, i * delay);
            }
            setTimeout( function() { $('.note-name').removeClass("bounce"); }, (notes.length + 1) * delay );
            setTimeout(cycle.loop, (notes.length + 2) * delay);
        } else {
            cycle.isLooping = false;
        }
    };

    cycle.togglePlay = function(noteName) {

        if (!Cycle.toneMap[noteName]) {
            throw "Invalid note in toneMap";
        }


        if (cycle.toLoop.hasOwnProperty(noteName)) {
            delete cycle.toLoop[noteName];
        } else {
            cycle.toLoop[noteName] = true;
            if (!cycle.isLooping) {
                cycle.loop();
            }
        }

        $('#' + noteName).toggleClass('pressed');
        cycle.doRender();
    };

    cycle.resetLoop = function() {
        cycle.toLoop = {};
    };

    cycle.getNoteSymbol = function(noteName) {
        return cycle.toneMap[noteName].symbol;
    };

    cycle.searchForScales = function() {
        var matches = [];
        var activeScaleRelationships = [];
        if (!(_.keys(cycle.toneMap).length)) {
            throw "Scales were not initialized";
        }

        var playing = Object.keys(cycle.toLoop);
        if (playing.length > 0) {
            // Something is playing... look for scales that all playing notes are within
            for (var toneIndex in playing) {
                var scalesContainingCurrentKey = _.keys(cycle.toneMap[playing[toneIndex]].inScales);
                activeScaleRelationships.push(scalesContainingCurrentKey);
            }

            // Find the intersection of all scales associated with the currently playing notes.
            matches = _.intersect.apply(this, activeScaleRelationships);
        }
        return {
            'playing': _.map(playing, function(val) {
                return Cycle.toneMap[val].symbol;
            }),
            'related': matches
        };
    };

    return cycle;
})();

Wheel = (function($) {
    var canvas,
        properties = {
            RADIUS: 120,
            LINE_WIDTH: 90,
            DIVIDER_WIDTH: 10,
            DIVIDER_RADIUS: 170,
            DIVIDER_COLOR: '#FFFFFF',
            COUNTER_CLOCKWISE: false,
            LABEL_RADIUS: 150,
            ARC_LENGTH: Math.PI / (_.size(Cycle.toneMap) / 2), // One-nth of the circle
            SIZE: 400
        };

    return {
        init: function(id) {
            canvas = document.getElementById(id);
            canvas.width = properties.SIZE;
            canvas.height = properties.SIZE;
            $.extend(properties, {
                X: canvas.width / 2,
                Y: canvas.height / 2
            });
        },
        draw: function(colors) {
            colors = colors || [];
            var ctx = canvas.getContext('2d');
            var p = properties;

            if (Cycle.toneMap && colors.length) {
                var noteNames = _.keys(Cycle.toneMap);
                $.each(colors, function(i, el) {
                    ctx.beginPath();
                    var begin = p.ARC_LENGTH * i - (p.ARC_LENGTH/2);
                    var end = begin + p.ARC_LENGTH;

                    ctx.arc(p.X, p.Y, p.RADIUS, begin, end, p.COUNTER_CLOCKWISE);
                    ctx.lineWidth = p.LINE_WIDTH;
                    // line color
                    ctx.strokeStyle = el;
                    ctx.stroke();

                    var xCalculated = Math.cos(i * p.ARC_LENGTH) * p.LABEL_RADIUS,
                        yCalculated = Math.sin(i * p.ARC_LENGTH) * p.LABEL_RADIUS;
                    var pos = {
                        // these values are invented
                        x: xCalculated - (0.15 * xCalculated) - 8,
                        y: yCalculated - (0.2 * yCalculated) - 16
                    };

                    $('#buttons').append(
                        '<a href="#" class="note-name animated" id="' + noteNames[i] + '" style="left: ' + pos.x + 'px; top: ' + pos.y + 'px">' + Cycle.getNoteSymbol(noteNames[i]) + '</a>'
                    );
                });

                // Draw a star that creates the divisions between sections
                ctx.translate(p.X, p.Y);
                ctx.rotate(p.ARC_LENGTH / 2);
                for (var i = 0; i < colors.length / 2; i++) {
                    ctx.beginPath();
                    ctx.lineWidth = p.DIVIDER_WIDTH;
                    // line color
                    ctx.strokeStyle = p.DIVIDER_COLOR;
                    ctx.moveTo(-p.DIVIDER_RADIUS, 0);
                    ctx.lineTo(p.DIVIDER_RADIUS, 0);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.rotate(p.ARC_LENGTH);
                }
                ctx.translate(-p.X, -p.Y);


            } else {
                throw "No color array defined";
            }

        }
    };
})(jQuery);