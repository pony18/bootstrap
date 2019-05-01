import Modal from './modal'
import EventHandler from '../dom/eventHandler'
import { makeArray } from '../util/index'

/** Test helpers */
import { getFixture, clearFixture, createEvent } from '../../tests/helpers/fixture'

describe('Modal', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()

    const backdropList = makeArray(document.querySelectorAll('.modal-backdrop'))

    backdropList.forEach(backdrop => {
      document.body.removeChild(backdrop)
    })
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Modal.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(Modal.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('toggle', () => {
    it('should toggle a modal', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.bs.modal', () => {
        modal.toggle()
      })

      modalEl.addEventListener('hidden.bs.modal', () => {
        expect().nothing()
        done()
      })

      modal.toggle()
    })
  })

  describe('show', () => {
    it('should show a modal', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('show.bs.modal', e => {
        expect(e).toBeDefined()
      })

      modalEl.addEventListener('shown.bs.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual('true')
        expect(modalEl.getAttribute('aria-hidden')).toEqual(null)
        expect(modalEl.style.display).toEqual('block')
        expect(document.querySelector('.modal-backdrop')).toBeDefined()
        done()
      })

      modal.show()
    })

    it('should show a modal without backdrop', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl, {
        backdrop: false
      })

      modalEl.addEventListener('show.bs.modal', e => {
        expect(e).toBeDefined()
      })

      modalEl.addEventListener('shown.bs.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual('true')
        expect(modalEl.getAttribute('aria-hidden')).toEqual(null)
        expect(modalEl.style.display).toEqual('block')
        expect(document.querySelector('.modal-backdrop')).toBeNull()
        done()
      })

      modal.show()
    })

    it('should show a modal and append the element', done => {
      const modalEl = document.createElement('div')
      const id = 'dynamicModal'

      modalEl.setAttribute('id', id)
      modalEl.classList.add('modal')
      modalEl.innerHTML = '<div class="modal-dialog"></div>'

      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.bs.modal', () => {
        expect(document.getElementById(id)).toBeDefined()
        done()
      })

      modal.show()
    })

    it('should do nothing if a modal is shown', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(EventHandler, 'trigger')
      modal._isShown = true

      modal.show()

      expect(EventHandler.trigger).not.toHaveBeenCalled()
    })

    it('should do nothing if a modal is transitioning', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(EventHandler, 'trigger')
      modal._isTransitioning = true

      modal.show()

      expect(EventHandler.trigger).not.toHaveBeenCalled()
    })

    it('should not fire shown event when show is prevented', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('show.bs.modal', e => {
        e.preventDefault()

        const expectedDone = () => {
          expect().nothing()
          done()
        }

        setTimeout(expectedDone, 10)
      })

      modalEl.addEventListener('shown.bs.modal', () => {
        throw new Error('shown event triggered')
      })

      modal.show()
    })

    it('should set is transitioning if fade class is present', done => {
      fixtureEl.innerHTML = '<div class="modal fade"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('show.bs.modal', () => {
        expect(modal._isTransitioning).toEqual(true)
      })

      modalEl.addEventListener('shown.bs.modal', () => {
        expect(modal._isTransitioning).toEqual(false)
        done()
      })

      modal.show()
    })

    it('should close modal when a click occured on data-dismiss="modal"', done => {
      fixtureEl.innerHTML = [
        '<div class="modal fade">',
        '  <div class="modal-dialog">',
        '    <div class="modal-header">',
        '      <button type="button" data-dismiss="modal"></button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const btnClose = fixtureEl.querySelector('[data-dismiss="modal"]')
      const modal = new Modal(modalEl)

      spyOn(modal, 'hide').and.callThrough()

      modalEl.addEventListener('shown.bs.modal', () => {
        btnClose.click()
      })

      modalEl.addEventListener('hidden.bs.modal', () => {
        expect(modal.hide).toHaveBeenCalled()
        done()
      })

      modal.show()
    })

    it('should set modal body scroll top to 0 if .modal-dialog-scrollable', done => {
      fixtureEl.innerHTML = [
        '<div class="modal fade">',
        '  <div class="modal-dialog modal-dialog-scrollable">',
        '    <div class="modal-body"></div>',
        '  </div>',
        '</div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const modalBody = modalEl.querySelector('.modal-body')
      const modal = new Modal(modalEl)

      spyOn(modal, 'hide').and.callThrough()

      modalEl.addEventListener('shown.bs.modal', () => {
        expect(modalBody.scrollTop).toEqual(0)
        done()
      })

      modal.show()
    })

    it('should not enforce focus if focus equal to false', done => {
      fixtureEl.innerHTML = '<div class="modal fade"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl, {
        focus: false
      })

      spyOn(modal, '_enforceFocus')

      modalEl.addEventListener('shown.bs.modal', () => {
        expect(modal._enforceFocus).not.toHaveBeenCalled()
        done()
      })

      modal.show()
    })

    it('should add listener when escape touch is pressed', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(modal, 'hide').and.callThrough()

      modalEl.addEventListener('shown.bs.modal', () => {
        const keydownEscape = createEvent('keydown')
        keydownEscape.which = 27

        modalEl.dispatchEvent(keydownEscape)
      })

      modalEl.addEventListener('hidden.bs.modal', () => {
        expect(modal.hide).toHaveBeenCalled()
        done()
      })

      modal.show()
    })

    it('should do nothing when the pressed key is not escape', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(modal, 'hide')

      const expectDone = () => {
        expect(modal.hide).not.toHaveBeenCalled()

        done()
      }

      modalEl.addEventListener('shown.bs.modal', () => {
        const keydownTab = createEvent('keydown')
        keydownTab.which = 9

        modalEl.dispatchEvent(keydownTab)
        setTimeout(expectDone, 30)
      })

      modal.show()
    })

    it('should adjust dialog on resize', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(modal, '_adjustDialog').and.callThrough()

      const expectDone = () => {
        expect(modal._adjustDialog).toHaveBeenCalled()

        done()
      }

      modalEl.addEventListener('shown.bs.modal', () => {
        const resizeEvent = createEvent('resize')

        window.dispatchEvent(resizeEvent)
        setTimeout(expectDone, 10)
      })

      modal.show()
    })

    it('should not close modal when clicking outside of modal-content if backdrop = false', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl, {
        backdrop: false
      })

      const shownCallback = () => {
        setTimeout(() => {
          expect(modal._isShown).toEqual(true)
          done()
        }, 10)
      }

      modalEl.addEventListener('shown.bs.modal', () => {
        modalEl.click()
        shownCallback()
      })

      modalEl.addEventListener('hidden.bs.modal', () => {
        throw new Error('Should not hide a modal')
      })

      modal.show()
    })
  })

  describe('hide', () => {
    it('should hide a modal', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.bs.modal', () => {
        modal.hide()
      })

      modalEl.addEventListener('hide.bs.modal', e => {
        expect(e).toBeDefined()
      })

      modalEl.addEventListener('hidden.bs.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual(null)
        expect(modalEl.getAttribute('aria-hidden')).toEqual('true')
        expect(modalEl.style.display).toEqual('none')
        expect(document.querySelector('.modal-backdrop')).toBeNull()
        done()
      })

      modal.show()
    })

    it('should close modal when clicking outside of modal-content', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.bs.modal', () => {
        modalEl.click()
      })

      modalEl.addEventListener('hidden.bs.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual(null)
        expect(modalEl.getAttribute('aria-hidden')).toEqual('true')
        expect(modalEl.style.display).toEqual('none')
        expect(document.querySelector('.modal-backdrop')).toBeNull()
        done()
      })

      modal.show()
    })

    it('should do nothing is the modal is not shown', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modal.hide()

      expect().nothing()
    })

    it('should do nothing is the modal is transitioning', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modal._isTransitioning = true
      modal.hide()

      expect().nothing()
    })

    it('should not hide a modal if hide is prevented', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.bs.modal', () => {
        modal.hide()
      })

      const hideCallback = () => {
        setTimeout(() => {
          expect(modal._isShown).toEqual(true)
          done()
        }, 10)
      }

      modalEl.addEventListener('hide.bs.modal', e => {
        e.preventDefault()
        hideCallback()
      })

      modalEl.addEventListener('hidden.bs.modal', () => {
        throw new Error('should not trigger hidden')
      })

      modal.show()
    })
  })

  describe('dispose', () => {
    it('should dispose a modal', () => {
      fixtureEl.innerHTML = '<div id="exampleModal" class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      expect(Modal._getInstance(modalEl)).toEqual(modal)

      spyOn(EventHandler, 'off')

      modal.dispose()

      expect(Modal._getInstance(modalEl)).toEqual(null)
      expect(EventHandler.off).toHaveBeenCalledTimes(4)
    })
  })

  describe('handleUpdate', () => {
    it('should call adjust dialog', () => {
      fixtureEl.innerHTML = '<div id="exampleModal" class="modal"><div class="modal-dialog" /></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(modal, '_adjustDialog')

      modal.handleUpdate()

      expect(modal._adjustDialog).toHaveBeenCalled()
    })
  })

  describe('data-api', () => {
    it('should open modal', done => {
      fixtureEl.innerHTML = [
        '<button type="button" data-toggle="modal" data-target="#exampleModal"></button>',
        '<div id="exampleModal" class="modal"><div class="modal-dialog" /></div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const trigger = fixtureEl.querySelector('[data-toggle="modal"]')

      modalEl.addEventListener('shown.bs.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual('true')
        expect(modalEl.getAttribute('aria-hidden')).toEqual(null)
        expect(modalEl.style.display).toEqual('block')
        expect(document.querySelector('.modal-backdrop')).toBeDefined()
        done()
      })

      trigger.click()
    })

    it('should not recreate a new modal', done => {
      fixtureEl.innerHTML = [
        '<button type="button" data-toggle="modal" data-target="#exampleModal"></button>',
        '<div id="exampleModal" class="modal"><div class="modal-dialog" /></div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)
      const trigger = fixtureEl.querySelector('[data-toggle="modal"]')

      spyOn(modal, 'show').and.callThrough()

      modalEl.addEventListener('shown.bs.modal', () => {
        expect(modal.show).toHaveBeenCalled()
        done()
      })

      trigger.click()
    })

    it('should prevent default when the trigger is <a> or <area>', done => {
      fixtureEl.innerHTML = [
        '<a data-toggle="modal" href="#" data-target="#exampleModal"></a>',
        '<div id="exampleModal" class="modal"><div class="modal-dialog" /></div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const trigger = fixtureEl.querySelector('[data-toggle="modal"]')

      spyOn(Event.prototype, 'preventDefault').and.callThrough()

      modalEl.addEventListener('shown.bs.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual('true')
        expect(modalEl.getAttribute('aria-hidden')).toEqual(null)
        expect(modalEl.style.display).toEqual('block')
        expect(document.querySelector('.modal-backdrop')).toBeDefined()
        expect(Event.prototype.preventDefault).toHaveBeenCalled()
        done()
      })

      trigger.click()
    })

    it('should focus the trigger on hide', done => {
      fixtureEl.innerHTML = [
        '<a data-toggle="modal" href="#" data-target="#exampleModal"></a>',
        '<div id="exampleModal" class="modal"><div class="modal-dialog" /></div>'
      ].join('')

      // the element must be displayed, without that activeElement won't change
      fixtureEl.style.display = 'block'

      const modalEl = fixtureEl.querySelector('.modal')
      const trigger = fixtureEl.querySelector('[data-toggle="modal"]')

      spyOn(trigger, 'focus')

      modalEl.addEventListener('shown.bs.modal', () => {
        const modal = Modal._getInstance(modalEl)

        modal.hide()
      })

      const hideListener = () => {
        setTimeout(() => {
          expect(trigger.focus).toHaveBeenCalled()
          fixtureEl.style.display = 'none'
          done()
        }, 20)
      }

      modalEl.addEventListener('hidden.bs.modal', () => {
        hideListener()
      })

      trigger.click()
    })

    it('should not focus the trigger if the modal is not visible', done => {
      fixtureEl.innerHTML = [
        '<a data-toggle="modal" href="#" data-target="#exampleModal"></a>',
        '<div id="exampleModal" class="modal"><div class="modal-dialog" /></div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const trigger = fixtureEl.querySelector('[data-toggle="modal"]')

      spyOn(trigger, 'focus')

      modalEl.addEventListener('shown.bs.modal', () => {
        const modal = Modal._getInstance(modalEl)

        modal.hide()
      })

      const hideListener = () => {
        setTimeout(() => {
          expect(trigger.focus).not.toHaveBeenCalled()
          done()
        }, 20)
      }

      modalEl.addEventListener('hidden.bs.modal', () => {
        hideListener()
      })

      trigger.click()
    })

    it('should not focus the trigger if the modal is not shown', done => {
      fixtureEl.innerHTML = [
        '<a data-toggle="modal" href="#" data-target="#exampleModal"></a>',
        '<div id="exampleModal" class="modal"><div class="modal-dialog" /></div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const trigger = fixtureEl.querySelector('[data-toggle="modal"]')

      spyOn(trigger, 'focus')

      const showListener = () => {
        setTimeout(() => {
          expect(trigger.focus).not.toHaveBeenCalled()
          done()
        }, 10)
      }

      modalEl.addEventListener('show.bs.modal', e => {
        e.preventDefault()
        showListener()
      })

      trigger.click()
    })
  })
})
