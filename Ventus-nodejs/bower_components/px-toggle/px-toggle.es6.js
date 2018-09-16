(function() {
  'use strict';

    Polymer({
      is: 'px-toggle',
      behaviors : [Polymer.IronCheckedElementBehavior],
      /* Properties for this component */
      properties: {

          /**
           * The size of the toggle element. Can be one of
           * small, regular (default), large & huge.
           * @type {String}
           */
          size: {
            type: String,
            value: ""
          },

          /**
           * The disabled state attribute for the component.
           * @type {Boolean}
           * @default false
           */
          disabled: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
          }
      },
      listeners : {
        'tap': '_onCheckTap'
      },

      attached() {
        this.setAttribute('role','switch');
      },

      _checkDisabledState(disabled){
        this.setAttribute('aria-disabled',disabled);
        return `${(disabled ? 'toggle--disabled' : '')}`;
      },

      _checkLabelSize(size){
        return `toggle__label--${size}`;
      },

      _checkInputSize(size){
        return `toggle__input--${size}`;
      },

      /**
       * Event fired when the user changes the status of the toggle.
       * `event.detail` will contain the new checked status (true or false)
       *
       * @event px-toggle-check-changed
       */

      _onCheckTap(evt) {
        if(!this.disabled) {
          this.debounce('checkChanged', function() {
            this.checked = !this.checked;
            this.fire('px-toggle-checked-changed', this.checked);
          },50);
        }
      }
    });
  }
)();
