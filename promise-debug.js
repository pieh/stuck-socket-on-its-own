const pending = new Set()

global.Promise = class extends Promise {
  constructor(factory) {
    super((resolve, reject) => {
      const here = new Error(`Not resolved promise`)
      pending.add(here)

      factory(
        r => {
          pending.delete(here)
          resolve(r)
        },
        e => {
          pending.delete(here)
          reject(e)
        }
      )
    })
  }
}

const logUnresolved = () => {
  const stacks = new Set()

  for (const err of pending) {
    stacks.add(err.stack)
  }

  if (stacks.size === 0) {
    console.log(
      `\n0 unresolved promises (PID: ${process.pid} ${process.argv
        .slice(1)
        .join(` `)})\n`
    )
    return
  }

  console.log(
    `\nUnresolved Promises (PID: ${process.pid} ${process.argv
      .slice(1)
      .join(` `)})\n`
  )

  for (const stack of stacks) {
    console.log(
      stack.replace(
        /^((Error: Not resolved promise[^\r\n]*[\r\n])|(\s*))/gm,
        ``
      ) + `\n`
      // .replace(/^\s+/gm, ``) + `\n`
    )
  }
}

console.log(
  `\nCatching promises PID: ${process.pid} ${process.argv.slice(1).join(` `)}\n`
)

exports.logUnresolved = logUnresolved

global.DEBUG_logUnresolved = logUnresolved

process.on("SIGUSR2", function () {
  console.log("SIGUSR2 recieved")
  logUnresolved()
})
