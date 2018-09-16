(function() {
  Polymer({

    is: 'px-panel',

    behaviors: [
      Polymer.IronResizableBehavior,
      Polymer.IronA11yKeysBehavior
    ],

    listeners: {
      'iron-resize': '_handleResize'
    },

    /**
     * Used by iron-a11y-keys-behavior.
     */
    keyBindings: {
      'esc': 'close'
    },

    hostAttributes: {
      'role': 'region'
    },

    properties: {
      /**
      * Where to place the panel - one of `top`, `bottom`, `left`, or `right`.
      */
      position: {
        type: String,
        value: 'right',
        observer: '_handleResize'
      },
      /**
       * Whether the panel is currently open (expanded).
       */
      opened: {
        type: Boolean,
        value: false,
        notify: true,
        observer: '_handleResize'
      },
      /**
       * If set to true, the panel will have `position:fixed` so it will
       * be attached to the browser window instead of its parent container.
       */
      fixed: {
        type: Boolean,
        value: false,
        observer: '_handleResize'
      },
      /**
       * If set to true, the panel will be opened and calls to the `close()` method will be ignored.
       * Mutating the `opened` property will still force a close of the panel.
       */
      persistent: {
        type: Boolean,
        value: false,
        observer: '_persistentChanged'
      },
      /**
       * Whether to display the panel with a `light`, `medium`, or `dark` background.
       * These terms are relative, and can be used in conjunction with px-theme,
       * px-dark-theme, or your custom theme or CSS variables to toggle between 3 different
       * background colors.
       */
      background: {
        type: String,
        value: 'light'
      },
      /**
       * If set to true, the panel will appear with an offset relative to the screen / container edges.
       * Can be overridden or customized using the CSS variables.
       */
      floating: {
        type: Boolean,
        value: false
      },
      /**
       * If set to true, the panel will not fully collapse when closed. It will appear in a minimized state.
       * You can use the content slot `minimized` to determine what will appear inside the panel while minimized
       * (likely an icon or button for fully opening the panel).
       */
      minimizable: {
        type: Boolean,
        value: false
      },
      /**
       * Used internally to determine if the panel should display at full-width or full-height
       * for mobile responsiveness and space-constrained situations.
       */
      _fullSize: {
        type: Boolean,
        value: false
      },
      /**
       * Used by iron-a11y-keys-behavior.
       */
      keyEventTarget: {
        type: Object,
        value: function() {
          return document.body;
        }
      }

    },
    /**
    * Opens the panel.
    */
    open() {
      this.opened = true;
    },
    /**
    * Closes the panel. Also called by iron-a11y-keys-behavior when a user presses the "Esc" key.
    */
    close() {
      if(!this.persistent) {
        this.opened = false;
      }
    },
    /**
     * Returns the appropriate classes based on the property values.
     */
    _getContainerClasses(position,background,fixed,persistent,opened,floating,minimizable,fullSize) {
      var classes = [position, background];
      if(fixed) classes.push('fixed');
      if(persistent) classes.push('persistent');
      if(opened) classes.push('opened');
      if(floating) classes.push('floating');
      if(minimizable) classes.push('minimizable');
      if(fullSize) classes.push('full-size');
      return classes.join(' ');
    },
    /**
     * Sets the `opened` property for persistent panels.
     */
    _persistentChanged(newValue) {
      if(newValue && !this.opened) {
        this.open();
      }
    },
    /**
     * Called when an `iron-resize` event notifies the element that its
     * parent container size may have changed.
     *
     * Size changed events will be collapsed to only trigger a new measurement
     * every 100ms. If the panel is currently hidden, measure events
     * will not be triggered.
     */
    _handleResize(e) {
      const debouncer = 'measure-available-width';
      if (typeof this._availableWidth !== 'number') {
        this._measureAvailableWidth();
        return;
      }
      if (this.isDebouncerActive(debouncer)) {
        this.cancelDebouncer(debouncer);
      }
      this.debounce(debouncer, this._measureAvailableWidth.bind(this), 100);
    },
    /**
     * Determines whether the panel should be displayed fullSize for responsiveness.
     */
    _measureAvailableWidth() {
      if(this.fixed) {
        if(((this.position === "left" || this.position === "right") && window.innerWidth < 600) ||
          ((this.position === "top" || this.position === "bottom") && window.innerHeight < 600)) {
          this._fullSize = true;
        }
        else {
          this._fullSize = false;
        }
      }
      else {
        if(((this.position === "left" || this.position === "right") && this.parentNode.getBoundingClientRect().width < 600) ||
          ((this.position === "top" || this.position === "bottom") && this.parentNode.getBoundingClientRect().height < 600)) {
          this._fullSize = true;
        }
        else {
          this._fullSize = false;
        }
      }
    },
    _isHidden(minimizable, opened) {
      return (minimizable && opened) || !minimizable;
    }

  });
})();
