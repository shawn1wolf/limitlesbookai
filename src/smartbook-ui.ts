// This is a component file. You can use this file to define a custom component for your project.
// This component will appear as a custom component in the editor.

// client/smartbook-ui.ts
import * as ecs from '@8thwall/ecs'

const getSectionFromUrl = (): string => {
  const p = new URLSearchParams(location.search)
  return (p.get('section') || '').toLowerCase()
}

const buildInstructions = (section: string): string[] => {
  const base = [
    'Welcome to the Limitless Movement Smart Book AR by Shawn Wolf Abrams & Greg D. Rogers',
    ' Step 1 - Allow camera access when prompted. Ensure camera is clear!',
    ' Step 2 - Hold your phone over the page so it fills the frame. Ensure entire image is in your frame.',

  ]
  const map: Record<string, string> = {
    'Limitless Innovation': 'Start by scanning the Limitless Innovation page.',

  }
  const line = map[section] || 'This scan is on the Limitless Innovation page.'
  return [...base, line, 'Need a refresher later? Tap Help anytime.']
}

ecs.registerComponent({
  name: 'smartbook-ui',
  schema: {
    overlay: ecs.eid,
    startBtn: ecs.eid,
    helpBtn: ecs.eid,
  },

  add: (world, component) => {
    const section = getSectionFromUrl()
    const lines = buildInstructions(section)

    // Full-screen overlay container
    const overlay = world.createEntity()
    ecs.Ui.set(world, overlay, {
      type: 'overlay',
      width: '100%',
      height: '100%',
      background: '#FF6A3D',
      backgroundOpacity: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      textAlign: 'center',
      color: '#000',
      fontSize: 25,
      font: 'Nunito',
    })

    // Instructions
    lines.forEach((text, i) => {
      const t = world.createEntity()
      ecs.Ui.set(world, t, {
        type: 'overlay',
        text,
        width: '70%',
        fontSize: i === 0 ? 20 : 19,
        textAlign: i === 0 ? 'center' : 'left',
        background: '',
        color: '#000',
      })
      world.setParent(t, overlay)
    })

    const startBtn = world.createEntity()
    ecs.Ui.set(world, startBtn, {
      type: 'overlay',
      text: 'Start',          // or '▶ TAP TO START' if you prefer
      width: '60%',           // keep your original sizing
      height: '52px',
      background: '#000000',  // <-- black
      color: '#000000',       // <-- white label for contrast
      borderRadius: 10,       // keep your existing radius
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 35,
      // font: 'CCBiffBamBoom',  // optional: use your comic font for punch
      // Optional visible outline on busy backgrounds:
      borderWidth: 3,
      borderColor: '#000000',
    })
    world.setParent(startBtn, overlay)

    const helpBtn = world.createEntity()
    ecs.Ui.set(world, helpBtn, {
      type: 'overlay',
      text: 'Tap For Help',
      width: '70px',
      height: '70px',
      background: '#FFFFFF',   // solid white background
      color: '#000',
      borderRadius: 28,        // circle (half of width/height)
      borderWidth: 3,          // <-- add border
      borderColor: '#000000',  // <-- border color
      fontSize: 20,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: '16px',
      right: '16px',
      stackingOrder: 6,
    })

    // Save refs
    component.schemaAttribute.set(component.eid, {overlay, startBtn, helpBtn})
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    const {overlay, startBtn, helpBtn} = schemaAttribute.get(eid)

    ecs.defineState('intro')
      .initial()
      .onEnter(() => {
        ecs.Hidden.remove(world, overlay)
        ecs.Hidden.set(world, helpBtn)
      })
      .onEvent(ecs.input.UI_CLICK, 'active', {target: startBtn})

    ecs.defineState('active')
      .onEnter(() => {
        ecs.Hidden.set(world, overlay)
        ecs.Hidden.remove(world, helpBtn)
      })
      .onEvent(ecs.input.UI_CLICK, 'intro', {target: helpBtn})
  },
})
