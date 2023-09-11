import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }
  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username)
      if (userExists) {
        throw new Error("Usuário já cadastrado")
      }

      const user = await GithubUser.search(username)
      console.log(user)

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado")
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(`${error.message}`)
    }
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
  }

  delete(user) {
    this.entries = this.entries.filter((entry) => entry.login !== user.login)
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector("table tbody")

    this.update()
    this.onAdd()
  }

  onAdd() {
    const addButton = this.root.querySelector(".search button")
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input")
      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach((user) => {
      const row = this.createRow()
      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`
      row.querySelector(".user img").alt = `Imagem ${user.name}`
      row.querySelector(".user a").href = `https://github.com/${user.login}`
      row.querySelector(".user a p").textContent = user.name
      row.querySelector(".user a span").textContent = user.login

      row.querySelector(".repositories").textContent = user.public_repos
      row.querySelector(".followers").textContent = user.followers

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm(`Tem certeza que deja remover ${user.login}?`)
        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement("tr")
    tr.innerHTML = `
        <td class="user">
          <img
            src="http://github.com/kennedysmartins.png"
            alt="Imagem Kennedy"
          />
          <a href="http://github.com/kennedysmartins" target="_blank">
            <p>Kennedy Martins</p>
            <span>kennedysmartins</span>
          </a>
        </td>
        <td class="repositories">19</td>
        <td class="followers">4</td>
        <td><button class="remove">&times;</button></td>
      `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove()
    })
  }
}
