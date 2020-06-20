import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  let header

  if (location.pathname === rootPath) {
    header = (
      <h1
        style={{
          ...scale(1),
          marginBottom: rhythm(0.5),
          marginTop: 0,
          color: "#fff",
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h1>
    )
  } else {
    header = (
      <h3
        style={{
          ...scale(1),
          marginBottom: rhythm(0.5),
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `#fff`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h3>
    )
  }
  return (
    <div>
      <header
        style={{
          background: "#0f0c29" /* fallback for old browsers */,
          background:
            "-webkit-linear-gradient(to right, #24243e, #302b63, #0f0c29)" /* Chrome 10-25, Safari 5.1-6 */,
          background:
            "linear-gradient(to right, #24243e, #302b63, #0f0c29)" /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */,
          paddingTop: 40,
          paddingBottom: 30,
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>{header}</div>
      </header>
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <main>{children}</main>
      </div>
      <footer
        style={{
          background: "#302b63",
          marginTop: 20,
          paddingBottom: 30,
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ color: "#fff" }}>
            <Link to="https://Twitter.com/RhysOliver">Twitter</Link>
            <Link to="https://GitHub.com/RRhys">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
