var su = require('stylus').utils,
    n = require('stylus/lib/nodes');

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

      size = u.noNull(size) ? size : new n.Unit(1);

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

      size = u.noNull(size) ? size : c.line.base;

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

      ratio = u.noNull(ratio) ? ratio.val : 1;
      current = u.noNull(current) ? current :
        f['prop'].call(this, new n.String('font-size'));

      var basePx = f['to-px'].call(this, base).val,
          currentPx = f['to-px'].call(this, current).val;

      return f['to-unit'].call(this, new n.Unit(
          ((basePx * basePx) / currentPx) * ratio
        ), c.unit);
    };


    /**
     * Typo paragraph mixin
     */
    var typoParagraph = function(fs, line, top, right, bottom, left) {
      var props = [n.null];

      if(u.noNull(fs)) {
        props.push(new n.Property([new n.Literal('font-size')], typoScaled.call(this, fs)));
      }

      props.push(new n.Property([new n.Literal('line-height')], typoLine.call(this, line)));

      bottom = u.noNull(bottom) ? bottom : top;
      left = u.noNull(left) ? left : right;

      var offsets = {
        top: top,
        left: left,
        right: right,
        bottom: bottom
      };
      var offset = typoScaled.call(this, new n.Unit(1)),
          offsetClone;

      for(var i in offsets) {
        if(u.noNull(offsets[i])) {
          if(offsets[i].val > 0) {
            offsetClone = offset.clone();
            offsetClone.val *= offsets[i].val;
            props.push(new n.Property([new n.Literal('margin-' + i)], offsetClone));
          }
        }
      }

      this.mixin(props, this.currentBlock);

      return n.null;
    };


    style.define('typo-scaled', typoScaled);
    style.define('typo-line', typoLine);
    style.define('typo-paragraph', typoParagraph);
    style.define('typo-relative', typoRelative);
  };
};
