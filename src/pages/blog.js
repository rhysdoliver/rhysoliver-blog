import React from "react"
import { Link, graphql } from "gatsby"
import { rhythm } from "../utils/typography"
import Layout from "../components/layout"
import SEO from "../components/seo"

const Blog = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allFile.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="Blog" />
      {posts.map(({ node }) => {
        const title =
          node.childMarkdownRemark.frontmatter.title ||
          node.childMarkdownRemark.fields.slug
        return (
          <article key={node.childMarkdownRemark.fields.slug}>
            <header>
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link
                  style={{ boxShadow: `none` }}
                  to={node.childMarkdownRemark.fields.slug}
                >
                  {title}
                </Link>
              </h3>
              <small>{node.childMarkdownRemark.frontmatter.date}</small>
            </header>
            <section>
              <p
                dangerouslySetInnerHTML={{
                  __html:
                    node.childMarkdownRemark.frontmatter.description ||
                    node.childMarkdownRemark.excerpt,
                }}
              />
            </section>
          </article>
        )
      })}
    </Layout>
  )
}

export default Blog

export const pageQuery = graphql`
  query Blog {
    site {
      siteMetadata {
        title
      }
    }
    allFile(
      filter: { sourceInstanceName: { eq: "blog" }, extension: { in: "md" } }
      sort: { fields: childMarkdownRemark___frontmatter___date, order: DESC }
    ) {
      edges {
        node {
          childMarkdownRemark {
            excerpt
            fields {
              slug
            }
            frontmatter {
              date(formatString: "dddd Do MMMM YYYY")
              title
              description
            }
          }
        }
      }
    }
  }
`
