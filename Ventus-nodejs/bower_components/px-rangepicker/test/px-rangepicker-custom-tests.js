// This is the placeholder suite to place custom tests in
// Use testCase(options) for a more convenient setup of the test cases
suite('interaction', function() {

  let picker, dropdown, rangeField;

  setup(function(done) {
    picker = fixture('px_rangepicker'),
    dropdown = Polymer.dom(picker.root).querySelector('#dropdown'),
    rangeField = Polymer.dom(picker.root).querySelector('px-datetime-range-field');

    flush(()=>{
      done();
    });
  });

  test('panel hidden at startup', function() {
    assert.isFalse(picker.opened);
  });

  test('clicking icon opens the panel', function() {
    var field = Polymer.dom(rangeField.root).querySelector('px-datetime-field'),
        entry = Polymer.dom(field.root).querySelector('px-datetime-entry'),
        icons = Polymer.dom(entry.root).querySelectorAll('px-icon');

  icons[0].click();
  assert.isTrue(picker.opened);
  });

});

suite('submit with buttons', function() {

  let picker, panel, rangeField, submitEventCount = 0,
      submitListener;

  setup(function(done) {
    picker = fixture('px_rangepicker');
    panel = Polymer.dom(Polymer.dom(picker.root).querySelector('px-rangepicker-content').root).querySelector('px-datetime-range-panel');
    rangeField = Polymer.dom(picker.root).querySelector('px-datetime-range-field');
    picker.set('fromMoment', moment("2017-01-05T00:30:00.000Z"));
    picker.set('toMoment', moment("2018-01-05T00:30:00.000Z"));
    picker.showButtons = true;

    submitListener = function(evt) {
      submitEventCount++;
    };
    picker.addEventListener('px-datetime-range-submitted', submitListener);

    flush(()=>{
      done();
    });
  });

  suiteTeardown(function() {
    picker.removeEventListener('px-datetime-range-submitted', submitListener);
  });

  test('Buttons are displayed', function(done) {
    var prevCount = submitEventCount;

    picker.opened = true;
    flush(()=>{
      assert.isTrue(panel.showButtons, "panel should have show buttons to true");
      done();
    });
  });

  test('invalid calendar cell disable apply', function(done) {
    var prevCount = submitEventCount;

    picker.opened = true;
    flush(()=>{
      field = Polymer.dom(rangeField.root).querySelector('px-datetime-field');
      entry = Polymer.dom(field.root).querySelector('px-datetime-entry');
      cells = Polymer.dom(entry.root).querySelectorAll('px-datetime-entry-cell');
      cellInput = Polymer.dom(cells[1].root).querySelector('input');

      cellInput.value = "99";
      cells[1]._handleBlur();
      picker.opened = true;

      flush(()=>{
        assert.isFalse(panel.allowApply, "Don't allow Apply");
        done();
      });
    });
  });
  test('invalid calendar cell disable apply', function(done) {
    var prevCount = submitEventCount;

    picker.opened = true;
    flush(()=>{
      field = Polymer.dom(rangeField.root).querySelector('px-datetime-field');
      entry = Polymer.dom(field.root).querySelector('px-datetime-entry');
      cells = Polymer.dom(entry.root).querySelectorAll('px-datetime-entry-cell');
      cellInput = Polymer.dom(cells[1].root).querySelector('input');

      cellInput.value = "99";
      cells[1]._handleBlur();
      picker.opened = true;

      flush(()=>{
        assert.isFalse(panel.allowApply, "Don't allow Apply");
        done();
      });
    });
  });

  test('valid calendar cell normal color', function(done) {
    var prevCount = submitEventCount;

    picker.opened = true;

    flush(()=>{
      assert.isTrue(panel.allowApply, "Do allow Apply");
      done();
    });
  });

  test('closing panel should not apply new value', function(done) {
    var prevCount = submitEventCount;

    picker.opened = true;
    flush(()=>{
      //change a date
      panel.toMoment = panel.toMoment.clone().add(1, 'day');

      picker.opened = false;

      //shouldn't have changed
      assert.equal(picker.fromMoment.toISOString(), "2017-01-05T00:30:00.000Z");
      assert.equal(picker.toMoment.toISOString(), "2018-01-05T00:30:00.000Z");
      // assert.equal(prevCount, submitEventCount);
      done();
    });
  });

  test('clicking apply should apply new value', function(done) {
    var prevCount = submitEventCount,
        buttons = Polymer.dom(panel.root).querySelectorAll('px-datetime-buttons'),
        applyBtn = Polymer.dom(buttons[0].root).querySelectorAll('#submitButton');

    picker.opened = true;

    //change a date

    flush(()=>{
      panel.toMoment = panel.toMoment.clone().add(1, 'day');
      //simulate apply
      applyBtn[0].click();
      assert.isFalse(picker.opened);

      assert.equal(picker.fromMoment.toISOString(), "2017-01-05T00:30:00.000Z");
      assert.equal(picker.toMoment.toISOString(), "2018-01-06T00:30:00.000Z");
      // assert.equal(prevCount + 1, submitEventCount);
      done();
    });
  });

  test('clicking cancel should not apply new value', function(done) {
    var prevCount = submitEventCount,
        buttons = Polymer.dom(panel.root).querySelectorAll('px-datetime-buttons'),
        bothBtn = Polymer.dom(buttons[0].root).querySelectorAll('button');

    picker.opened = true;

    //change a date
    panel.toMoment = panel.toMoment.clone().add(1, 'day');

    //simulate apply
    bothBtn[0].click();

    flush(()=>{
      assert.isFalse(picker.opened);

      //shouldn't have changed
      assert.equal(picker.fromMoment.toISOString(), "2017-01-05T00:30:00.000Z");
      assert.equal(picker.toMoment.toISOString(), "2018-01-05T00:30:00.000Z");
      // assert.equal(prevCount, submitEventCount);
      done();
    });
  });

  test('when not opened changing values should apply directly', function(done) {
    var prevCount = submitEventCount,
        e = document.createEvent('Event');

    //change a date
    rangeField.toMoment = rangeField.toMoment.clone().add(1, 'day');
    e.initEvent("blur", true, true);
    picker.dispatchEvent(e);

    flush(()=>{
      //should have changed
      assert.equal(picker.fromMoment.toISOString(), "2017-01-05T00:30:00.000Z");
      assert.equal(picker.toMoment.toISOString(), "2018-01-06T00:30:00.000Z");
      // assert.equal(prevCount + 1, submitEventCount);
      done();
    });
  });
});

suite('submit without buttons', function() {

  let picker, panel, rangeField,
  submitEventCount = 0,
  submitListener;

  setup(function(done) {
    picker = fixture('px_rangepicker');
    panel = Polymer.dom(Polymer.dom(picker.root).querySelector('px-rangepicker-content').root).querySelector('px-datetime-range-panel');
    rangeField = Polymer.dom(picker.root).querySelector('px-datetime-range-field');
    picker.set('fromMoment', moment("2017-01-05T00:30:00.000Z"));
    picker.set('toMoment', moment("2018-01-05T00:30:00.000Z"));
    picker.showButtons = false;

    submitListener = function(evt) {
      submitEventCount++;
    };
    picker.addEventListener('px-datetime-range-submitted', submitListener);

    flush(()=>{
      done();
    });
  });

  suiteTeardown(function() {
    picker.removeEventListener('px-datetime-range-submitted', submitListener);
  });

  test('Buttons are not displayed', function(done) {
    var prevCount = submitEventCount;

    picker.opened = true;
    flush(()=>{
      assert.isFalse(panel.showButtons, "panel should have show buttons to false");
      done();
    });
  });

  test('closing panel should apply new value', function(done) {
    var prevCount = submitEventCount;

    picker.set('opened', true);

    //change a date
    panel.set('toMoment', panel.toMoment.clone().add(1, 'day'));
    picker.set('opened', false);

    flush(()=>{
      //should have changed
      assert.equal(picker.fromMoment.toISOString(), "2017-01-05T00:30:00.000Z");
      assert.equal(picker.toMoment.toISOString(), "2018-01-06T00:30:00.000Z");
      // assert.equal(prevCount + 1, submitEventCount);
      done();
    });
  });

  test('closing panel when time not valid should not apply new value', function(done) {
    var prevCount = submitEventCount;

    picker.opened = true;

    //change a date
    panel.toMoment = panel.toMoment.clone().add(1, 'day');
    //make sure time is invalid
    panel._toTimeIsValid = false;

    picker.opened = false;

    flush(()=>{
      //shouldn't have changed
      assert.equal(picker.fromMoment.toISOString(), "2017-01-05T00:30:00.000Z");
      assert.equal(picker.toMoment.toISOString(), "2018-01-05T00:30:00.000Z");
      // assert.equal(prevCount, submitEventCount);

      panel._toTimeIsValid = true;
      done();
    });
  });

  test('when not opened changing values should apply directly on blur', function(done) {
    var prevCount = submitEventCount;
        e = document.createEvent('Event');

    //change a date
    rangeField.toMoment = rangeField.toMoment.clone().add(1, 'day');
    e.initEvent("blur", true, true);
    picker.dispatchEvent(e);

    flush(()=>{
      //should have changed
      assert.equal(picker.fromMoment.toISOString(), "2017-01-05T00:30:00.000Z");
      assert.equal(picker.toMoment.toISOString(), "2018-01-06T00:30:00.000Z");
      // assert.equal(prevCount + 1, submitEventCount);
      done();
    });
  });

  test('when not opened changing values should apply directly on Enter', function(done) {
    var prevCount = submitEventCount;
        e = document.createEvent('Event');

    //change a date
    rangeField.toMoment = rangeField.toMoment.clone().add(1, 'day');
    MockInteractions.pressAndReleaseKeyOn(rangeField, 13, [], 'Enter');

    flush(()=>{
      //should have changed
      assert.equal(picker.fromMoment.toISOString(), "2017-01-05T00:30:00.000Z");
      assert.equal(picker.toMoment.toISOString(), "2018-01-06T00:30:00.000Z");
      // assert.equal(prevCount + 1, submitEventCount);
      done();
    });
  });

  test('when not opened changing invalid values should not apply directly', function(done) {
    var prevCount = submitEventCount,
        e = document.createEvent('Event'),
        field = Polymer.dom(rangeField.root).querySelector('px-datetime-field'),
        entries = Polymer.dom(field.root).querySelectorAll('px-datetime-entry'),
        dateCells = Polymer.dom(entries[0].root).querySelectorAll('px-datetime-entry-cell'),
        dateInput = Polymer.dom(dateCells[1].root).querySelector('input');

    //change a date
    dateInput.value = "99";
    MockInteractions.pressAndReleaseKeyOn(field, 13, [], 'Enter');

    flush(()=>{
      //shouldn't have changed
      assert.isFalse(rangeField.isValid);
      assert.equal(picker.fromMoment.toISOString(), "2017-01-05T00:30:00.000Z");
      assert.equal(picker.toMoment.toISOString(), "2018-01-05T00:30:00.000Z");

      done();
    });
  });
});

suite('iron-dropdown positioning', function() {

  let frame, doc, html;

  setup(function(done) {
    frame = fixture('frameFxt');

    flush(() => {
      frame = document.querySelector("#frame"); //get the iframe
      doc = frame.contentDocument || frame.contentWindow.document;
      html = `
        <html>

        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Predix UI</title>
          <script src="../../webcomponentsjs/webcomponents-lite.js"><\/script>

          <link rel="import" href="../../polymer/polymer.html" />
          <link rel="import" href="../../px-theme/px-theme-styles.html">
          <link rel="import" href="../px-rangepicker.html" />

          <custom-style>
            <style include="px-theme-styles" is="custom-style"></style>
          </custom-style>
        </head>

        <body style="height: 500px">
          <div style="height: 300px"></div>
          <px-rangepicker
            show-buttons
            opened>
          </px-rangepicker>
        </body>

        </html>

      `;
      doc.open();
      doc.write(html);
      frame.contentWindow.addEventListener("WebComponentsReady", function(){
        console.log("hi");
        window.requestAnimationFrame(function(){
          setTimeout(function(){
            done();
          });
        });
      });
      doc.close();
    });
  });

  test('panel covers field when it cant fit top or bottom', function() {
    var rangepicker = doc.querySelector('px-rangepicker'),
        rangeField = rangepicker.$.rangeField,
        rangePanel = Polymer.dom(Polymer.dom(rangepicker.root).querySelector('px-rangepicker-content').root).querySelector('px-datetime-range-panel'),
        rangeFieldSize = rangeField.getBoundingClientRect(),
        rangePanelSize = rangePanel.getBoundingClientRect();

    assert.isAtMost(rangePanelSize.top, rangeFieldSize.top);
    assert.isAtLeast(rangePanelSize.bottom, rangeFieldSize.bottom);
  });

});

suite('layout', function() {
  let rangeFxt;

  setup(function(done) {
    flush(() => {
      rangeFxt = fixture('px_rangepicker');
      done();
    });
  });

  test('when showFieldTitles and fullWidth are true, display grid', function(done) {
    var rangeFields = Polymer.dom(rangeFxt.root).querySelector('px-datetime-range-field');
    rangeFxt.fullWidth = true;
    rangeFxt.showFieldTitles = true;

    flush(() => {
      debugger
      var styles = window.getComputedStyle(rangeFxt).width;
      assert.isTrue(rangeFields.fullWidth, "Rangefield fullWidth value");
      assert.equal(styles, "900px", "rangefield width");
      done();
    });
  });
});
