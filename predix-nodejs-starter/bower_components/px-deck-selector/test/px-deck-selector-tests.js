suite('Base Automation Tests for px-deck-selector', function(done) {
  let deckFixture;
  setup((done)=>{
    deckFixture = fixture('px-deck-selector-fixture');
    flush(()=>{
      done();
    });
  });

  test('Polymer exists', function() {
    assert.isTrue(Polymer !== null);
  });
  test('px-app-nav fixture is created', function() {
    assert.isTrue(deckFixture !== null);
    assert.isTrue(deckFixture.tagName === 'PX-DECK-SELECTOR');
  });

});

suite('Deck Selector tests', (done)=> {
  let deckFixture;
  setup((done)=>{
    deckFixture = fixture('px-deck-selector-fixture');
    flush(()=>{
      done();
    });
  });

  test('Dropdown icon is correct size', function() {
    let iconEl = Polymer.dom(deckFixture.root).querySelector('px-icon');
    assert.equal(window.getComputedStyle(iconEl).width, '16px');
  });

  test('First deck is selected by default', function() {
    let label = Polymer.dom(deckFixture.root).querySelector('.dropdown-text').innerText.trim();
    assert.equal(deckFixture.selectedDeck.name, 'First Deck');
    assert.equal(label, 'First Deck');
  });

  test('Deck can be selected programmatically', function() {
    deckFixture.set('selectedDeck', {"name": "Second Deck","url": "/deck2"});
    let label = Polymer.dom(deckFixture.root).querySelector('.dropdown-text').innerText.trim();
    assert.equal(deckFixture.selectedDeck.name, 'Second Deck');
    assert.equal(label, 'Second Deck');
  });

  test('Deck selector closes when selecting deck item', (done)=> {
    let deckDropdown = Polymer.dom(deckFixture.root).querySelector('.dropdown-menu');
        deckIcon = Polymer.dom(deckFixture.root).querySelector('.dropdown-text');
    deckIcon.click();
    assert.isFalse(deckDropdown.classList.contains('visuallyhidden'));

    Polymer.dom(deckFixture.root).querySelectorAll('li')[1].click();
    flush(()=>{
      assert.isTrue(deckDropdown.classList.contains('visuallyhidden'));
      done();
    });
  });

});

suite('Empty deck selector tests', ()=>{
  test('Empty deck selector should be hidden', ()=>{
    let deckFixture = fixture('px-deck-selector-empty-fixture'),
        deckDropdown = Polymer.dom(deckFixture.root).querySelector('.dropdown-text');
    assert.isTrue(deckDropdown.classList.contains('visuallyhidden', 'Empty deck selector should be hidden'));
  });
});
