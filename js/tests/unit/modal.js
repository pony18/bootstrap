$(function () {
  'use strict'

  window.Util = typeof bootstrap === 'undefined' ? Util : bootstrap.Util
  var Modal = typeof window.bootstrap === 'undefined' ? window.Modal : window.bootstrap.Modal

  QUnit.module('modal plugin')

  QUnit.test('should be defined on jquery object', function (assert) {
    assert.expect(1)
    assert.ok($(document.body).modal, 'modal method is defined')
  })

  QUnit.module('modal', {
    before: function () {
      // Enable the scrollbar measurer
      $('<style type="text/css"> .modal-scrollbar-measure { position: absolute; top: -9999px; width: 50px; height: 50px; overflow: scroll; } </style>').appendTo('head')
      // Function to calculate the scrollbar width which is then compared to the padding or margin changes
      $.fn.getScrollbarWidth = $.fn.modal.Constructor.prototype._getScrollbarWidth

      // Simulate scrollbars
      $('html').css('padding-right', '16px')
    },
    beforeEach: function () {
      // Run all tests in noConflict mode -- it's the only way to ensure that the plugin works in noConflict mode
      $.fn.bootstrapModal = $.fn.modal.noConflict()
    },
    afterEach: function () {
      $('.modal-backdrop, #modal-test').remove()
      $(document.body).removeClass('modal-open')
      $.fn.modal = $.fn.bootstrapModal
      delete $.fn.bootstrapModal
      $('#qunit-fixture').html('')
    }
  })

  QUnit.test('should provide no conflict', function (assert) {
    assert.expect(1)
    assert.strictEqual(typeof $.fn.modal, 'undefined', 'modal was set back to undefined (orig value)')
  })

  QUnit.test('should throw explicit error on undefined method', function (assert) {
    assert.expect(1)
    var $el = $('<div id="modal-test"><div class="modal-dialog" /></div>')
    $el.bootstrapModal()
    try {
      $el.bootstrapModal('noMethod')
    } catch (error) {
      assert.strictEqual(error.message, 'No method named "noMethod"')
    }
  })

  QUnit.test('should return jquery collection containing the element', function (assert) {
    assert.expect(2)
    var $el = $('<div id="modal-test"><div class="modal-dialog" /></div>')
    var $modal = $el.bootstrapModal()
    assert.ok($modal instanceof $, 'returns jquery collection')
    assert.strictEqual($modal[0], $el[0], 'collection contains element')
  })

  QUnit.test('should store the original body padding in data-padding-right before showing', function (assert) {
    assert.expect(2)
    var done = assert.async()
    var $body = $(document.body)
    var originalPadding = '0px'
    $body.css('padding-right', originalPadding)

    $('<div id="modal-test"><div class="modal-dialog" /></div>')
      .on('hidden.bs.modal', function () {
        assert.strictEqual(document.body.getAttribute('data-padding-right'), null, 'data-padding-right should be cleared after closing')
        $body.removeAttr('style')
        done()
      })
      .on('shown.bs.modal', function () {
        assert.strictEqual($body.data('padding-right'), originalPadding, 'original body padding should be stored in data-padding-right')
        $(this).bootstrapModal('hide')
      })
      .bootstrapModal('show')
  })

  QUnit.test('should not adjust the inline body padding when it does not overflow', function (assert) {
    assert.expect(1)
    var done = assert.async()
    var $body = $(document.body)
    var originalPadding = $body.css('padding-right')

    // Hide scrollbars to prevent the body overflowing
    $body.css('overflow', 'hidden') // Real scrollbar (for in-browser testing)
    $('html').css('padding-right', '0px') // Simulated scrollbar (for PhantomJS)

    $('<div id="modal-test"><div class="modal-dialog" /></div>')
      .on('shown.bs.modal', function () {
        var currentPadding = $body.css('padding-right')
        assert.strictEqual(currentPadding, originalPadding, 'body padding should not be adjusted')
        $(this).bootstrapModal('hide')

        // Restore scrollbars
        $body.css('overflow', 'auto')
        $('html').css('padding-right', '16px')
        done()
      })
      .bootstrapModal('show')
  })

  QUnit.test('should adjust the inline padding of fixed elements when opening and restore when closing', function (assert) {
    assert.expect(2)
    var done = assert.async()
    var $element = $('<div class="fixed-top"></div>').appendTo('#qunit-fixture')
    var originalPadding = parseInt($element.css('padding-right'), 10)

    $('<div id="modal-test"><div class="modal-dialog" /></div>')
      .on('hidden.bs.modal', function () {
        var currentPadding = parseInt($element.css('padding-right'), 10)
        assert.strictEqual(currentPadding, originalPadding, 'fixed element padding should be reset after closing')
        $element.remove()
        done()
      })
      .on('shown.bs.modal', function () {
        var expectedPadding = parseFloat(originalPadding) + parseInt($(this).getScrollbarWidth(), 10)
        var currentPadding = parseInt($element.css('padding-right'), 10)
        assert.strictEqual(currentPadding, expectedPadding, 'fixed element padding should be adjusted while opening')
        $(this).bootstrapModal('hide')
      })
      .bootstrapModal('show')
  })

  QUnit.test('should store the original padding of fixed elements in data-padding-right before showing', function (assert) {
    assert.expect(2)
    var done = assert.async()
    var $element = $('<div class="fixed-top"></div>').appendTo('#qunit-fixture')
    var originalPadding = '0px'
    $element.css('padding-right', originalPadding)

    $('<div id="modal-test"><div class="modal-dialog" /></div>')
      .on('hidden.bs.modal', function () {
        assert.strictEqual($element[0].getAttribute('data-padding-right'), null, 'data-padding-right should be cleared after closing')
        $element.remove()
        done()
      })
      .on('shown.bs.modal', function () {
        assert.strictEqual($element.data('padding-right'), originalPadding, 'original fixed element padding should be stored in data-padding-right')
        $(this).bootstrapModal('hide')
      })
      .bootstrapModal('show')
  })

  QUnit.test('should adjust the inline margin of sticky elements when opening and restore when closing', function (assert) {
    assert.expect(2)
    var done = assert.async()
    var $element = $('<div class="sticky-top"></div>').appendTo('#qunit-fixture')
    var originalPadding = parseInt($element.css('margin-right'), 10)

    $('<div id="modal-test"><div class="modal-dialog" /></div>')
      .on('hidden.bs.modal', function () {
        var currentPadding = parseInt($element.css('margin-right'), 10)
        assert.strictEqual(currentPadding, originalPadding, 'sticky element margin should be reset after closing')
        $element.remove()
        done()
      })
      .on('shown.bs.modal', function () {
        var expectedPadding = parseFloat(originalPadding) - $(this).getScrollbarWidth()
        var currentPadding = parseInt($element.css('margin-right'), 10)
        assert.strictEqual(currentPadding, expectedPadding, 'sticky element margin should be adjusted while opening')
        $(this).bootstrapModal('hide')
      })
      .bootstrapModal('show')
  })

  QUnit.test('should store the original margin of sticky elements in data-margin-right before showing', function (assert) {
    assert.expect(2)
    var done = assert.async()
    var $element = $('<div class="sticky-top"></div>').appendTo('#qunit-fixture')
    var originalPadding = '0px'
    $element.css('margin-right', originalPadding)

    $('<div id="modal-test"><div class="modal-dialog" /></div>')
      .on('hidden.bs.modal', function () {
        assert.strictEqual($element[0].getAttribute('data-margin-right'), null, 'data-margin-right should be cleared after closing')
        $element.remove()
        done()
      })
      .on('shown.bs.modal', function () {
        assert.strictEqual($element.data('margin-right'), originalPadding, 'original sticky element margin should be stored in data-margin-right')
        $(this).bootstrapModal('hide')
      })
      .bootstrapModal('show')
  })

  QUnit.test('should ignore values set via CSS when trying to restore body padding after closing', function (assert) {
    assert.expect(1)
    var done = assert.async()
    var $body = $(document.body)
    var $style = $('<style>body { padding-right: 42px; }</style>').appendTo('head')

    $('<div id="modal-test"><div class="modal-dialog" /></div>')
      .on('hidden.bs.modal', function () {
        assert.strictEqual($body.css('padding-left'), '0px', 'body does not have inline padding set')
        $style.remove()
        done()
      })
      .on('shown.bs.modal', function () {
        $(this).bootstrapModal('hide')
      })
      .bootstrapModal('show')
  })

  QUnit.test('should ignore other inline styles when trying to restore body padding after closing', function (assert) {
    assert.expect(2)
    var done = assert.async()
    var $body = $(document.body)
    var $style = $('<style>body { padding-right: 42px; }</style>').appendTo('head')

    $body.css('color', 'red')

    $('<div id="modal-test"><div class="modal-dialog" /></div>')
      .on('hidden.bs.modal', function () {
        assert.strictEqual($body[0].style.paddingRight, '', 'body does not have inline padding set')
        assert.strictEqual($body[0].style.color, 'red', 'body still has other inline styles set')
        $body.removeAttr('style')
        $style.remove()
        done()
      })
      .on('shown.bs.modal', function () {
        $(this).bootstrapModal('hide')
      })
      .bootstrapModal('show')
  })

  QUnit.test('should properly restore non-pixel inline body padding after closing', function (assert) {
    assert.expect(1)
    var done = assert.async()
    var $body = $(document.body)

    $body.css('padding-right', '5%')

    $('<div id="modal-test"><div class="modal-dialog" /></div>')
      .on('hidden.bs.modal', function () {
        assert.strictEqual($body[0].style.paddingRight, '5%', 'body does not have inline padding set')
        $body.removeAttr('style')
        done()
      })
      .on('shown.bs.modal', function () {
        $(this).bootstrapModal('hide')
      })
      .bootstrapModal('show')
  })

  QUnit.test('should not follow link in area tag', function (assert) {
    assert.expect(2)

    $('<map><area id="test" shape="default" data-toggle="modal" data-target="#modal-test" href="demo.html"/></map>')
      .appendTo('#qunit-fixture')

    var modalHtml = [
      '<div id="modal-test">',
      '  <div class="modal-dialog">',
      '    <div class="contents"><div id="close" data-dismiss="modal"/></div>',
      '  </div>',
      '</div>'
    ].join('')

    $(modalHtml)
      .appendTo('#qunit-fixture')

    // We need to use CustomEvent here to have a working preventDefault in IE tests.
    var evt = new CustomEvent('click', {
      bubbles: true,
      cancelable: true
    })

    $('#test')
      .on('click.bs.modal.data-api', function (event) {
        assert.notOk(event.defaultPrevented, 'navigating to href will happen')
      })

    $('#test')[0].dispatchEvent(evt)
    assert.ok(evt.defaultPrevented, 'model shown instead of navigating to href')
  })

  QUnit.test('should not try to open a modal which is already visible', function (assert) {
    assert.expect(1)
    var done = assert.async()
    var count = 0

    $('<div id="modal-test"><div class="modal-dialog" /></div>').on('shown.bs.modal', function () {
      count++
    }).on('hidden.bs.modal', function () {
      assert.strictEqual(count, 1, 'show() runs only once')
      done()
    })
      .bootstrapModal('show')
      .bootstrapModal('show')
      .bootstrapModal('hide')
  })

  QUnit.test('transition duration should be the modal-dialog duration before triggering shown event', function (assert) {
    assert.expect(1)
    var done = assert.async()
    var style = [
      '<style>',
      '  .modal.fade .modal-dialog {',
      '    transition: -webkit-transform .3s ease-out;',
      '    transition: transform .3s ease-out;',
      '    transition: transform .3s ease-out,-webkit-transform .3s ease-out;',
      '    -webkit-transform: translate(0,-50px);',
      '    transform: translate(0,-50px);',
      '  }',
      '</style>'
    ].join('')

    var $style = $(style).appendTo('head')
    var modalHTML = [
      '<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">',
      '  <div class="modal-dialog" role="document">',
      '    <div class="modal-content">',
      '      <div class="modal-body">...</div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('')

    var $modal = $(modalHTML).appendTo('#qunit-fixture')

    $modal.on('shown.bs.modal', function () {
      $style.remove()
      assert.ok(true)
      done()
    })
      .bootstrapModal('show')
  })

  QUnit.test('should dispose modal', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var $modal = $([
      '<div id="modal-test">',
      '  <div class="modal-dialog">',
      '    <div class="modal-content">',
      '      <div class="modal-body" />',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('')).appendTo('#qunit-fixture')

    $modal.on('shown.bs.modal', function () {
      var modal = Modal._getInstance($modal[0])
      var spy = sinon.spy($modal[0], 'removeEventListener')

      modal.dispose()

      assert.ok(!Modal._getInstance($modal[0]), 'modal data object was disposed')
      assert.ok(spy.called)
      done()
    }).bootstrapModal('show')
  })

  QUnit.test('should enforce focus', function (assert) {
    var isIE11 = Boolean(window.MSInputMethodContext) && Boolean(document.documentMode)

    if (isIE11) {
      assert.expect(1)
    } else {
      assert.expect(2)
    }

    var done = assert.async()

    var $modal = $([
      '<div id="modal-test" data-show="false">',
      '  <div class="modal-dialog">',
      '    <div class="modal-content">',
      '      <div class="modal-body" />',
      '    </div>',
      '  </div>',
      '</div>'
    ].join(''))
      .bootstrapModal()
      .appendTo('#qunit-fixture')

    var modal = Modal._getInstance($modal[0])
    var spy = sinon.spy(modal, '_enforceFocus')

    $modal.one('shown.bs.modal', function () {
      assert.ok(spy.called, '_enforceFocus called')
      var spyFocus = sinon.spy(modal._element, 'focus')

      function focusInListener() {
        assert.ok(spyFocus.called)
        document.removeEventListener('focusin', focusInListener)
        done()
      }

      if (isIE11) {
        done()
      } else {
        document.addEventListener('focusin', focusInListener)

        var focusInEvent = new Event('focusin')
        Object.defineProperty(focusInEvent, 'target', {
          value: $('#qunit-fixture')[0]
        })

        document.dispatchEvent(focusInEvent)
      }
    })
      .bootstrapModal('show')
  })

  QUnit.test('should scroll to top of the modal body if the modal has .modal-dialog-scrollable class', function (assert) {
    assert.expect(2)
    var done = assert.async()

    var $modal = $([
      '<div id="modal-test">',
      '  <div class="modal-dialog modal-dialog-scrollable">',
      '    <div class="modal-content">',
      '      <div class="modal-body" style="height: 100px; overflow-y: auto;">',
      '        <div style="height: 200px" />',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('')).appendTo('#qunit-fixture')

    var $modalBody = $('.modal-body')
    $modalBody.scrollTop(100)
    assert.ok($modalBody.scrollTop() > 95 && $modalBody.scrollTop() <= 100)

    $modal.on('shown.bs.modal', function () {
      assert.strictEqual($modalBody.scrollTop(), 0, 'modal body scrollTop should be 0 when opened')
      done()
    })
      .bootstrapModal('show')
  })

  QUnit.test('should return the version', function (assert) {
    assert.expect(1)
    assert.strictEqual(typeof Modal.VERSION, 'string')
  })
})
