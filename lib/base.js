var su = require('stylus').utils,
    n = require('stylus/lib/nodes');

function noNull(val) {
  return typeof val != 'undefined' ?
    val !== null ? val.nodeName != 'null' : false : false;
}

module.exports = function() {
  return function(style) {
    var u = style.options.extensions.utils,
        storage = style.options.extensions.storage;

    storage.set('stem-typo__config', {});

    style.define('typo-config', function(hash) {
      var data = u.merge(storage.get('stem-typo__config'), u.toJS(hash)),
          f = this.functions;

      storage.set('stem-typo__config', data);

      var coercedData = new n.Expression();
      coercedData.push(su.coerce(data, true));
      f.reassign.call(this, new n.String('TypoConfig'), coercedData);

      if(this.return) {
        return coercedData;
      }
    });


    var typoScaled = function(size) {
      var c = storage.get('stem-typo__config'),
          f = this.functions;

      size = noNull(size) ? size : new n.Unit(1);

      if(size.nodeName == 'string' || size.nodeName == 'literal' || size.nodeName == 'ident') {
        return typoScaled.call(this, c.size[size.string]);
      }

      if(size.nodeName == 'unit') {
        if(!!size.type) {
          size = f['to-unit'].call(this, size, c.unit, c.base);
          size = f['scale-modular_reverse']
            .call(this, c.scale.start, size, c.scale.rate, new n.Boolean(true));
          size.type = '';
        }

        size.val += c.scale.offset.val;

        var fs = c.scale.add.val + f['scale-modular'].call(this, c.scale.start,
              size, c.scale.rate).val,
            coerce = (size.val > 1 ? .25 : .125),
            fsd = fs % coerce;

        return new n.Unit(fs - (fsd < coerce / 3 ? fsd : fsd - coerce),
          c.unit.string);
      }

      return 0;
    };


    var typoLine = function(size) {
      var c = storage.get('stem-typo__config'),
          f = this.functions;

      size = noNull(size) ? size : c.line.base;

      if(size.nodeName == 'string' || size.nodeName == 'literal' || size.nodeName == 'ident') {
        return typoLine.call(this, c.size[size.string]);
      }

      return size;
    };


    /**
     * Getting the relative size, based on the different font-size.
     */
    var typoRelative = function(base, current, ratio) {
      var c = storage.get('stem-typo__config'),
          f = this.functions;

      ratio = noNull(ratio) ? ratio.val : 1;
      current = noNull(current) ? current :
        f['prop'].call(this, new n.String('font-size'));

      var basePx = f['to-px'].call(this, base).val,
          currentPx = f['to-px'].call(this, current).val;

      return f['to-unit'].call(this, new n.Unit(
          ((basePx * basePx) / currentPx) * ratio
        ), c.unit);
    };


    style.define('typo-scaled', typoScaled);
    style.define('typo-line', typoLine);
    style.define('typo-relative', typoRelative);
  };
};