import React from "react"
import { PageProps, Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"

type Data = {
  site: {
    siteMetadata: {
      title: string
    }
  }
  posts: {
    edges: {
      node: {
        childMarkdownRemark: {
          excerpt: string
          frontmatter: {
            title: string
            date: string
            description: string
          }
          fields: {
            slug: string
          }
        }
      }
    }[]
  }
  projects: {
    edges: {
      node: {
        childMarkdownRemark: {
          excerpt: string
          frontmatter: {
            title: string
            date: string
            description: string
          }
          fields: {
            slug: string
          }
        }
      }
    }[]
  }
}

const BlogIndex = ({ data, location }: PageProps<Data>) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.posts.edges
  const projects = data.projects.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts" />
      <Bio />
      <div>
        <h3>Blog Posts</h3>
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
        <Link to="/blog">See More</Link>
      </div>
      <hr />
      <div>
        <h3>Recent Projects</h3>
        {projects.map(({ node }) => {
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

        <Link to="/portfolio">See More</Link>
      </div>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query Summary {
    site {
      siteMetadata {
        title
      }
    }
    posts: allFile(
      filter: { sourceInstanceName: { eq: "blog" }, extension: { in: "md" } }
      sort: { fields: childMarkdownRemark___frontmatter___date, order: DESC }
      limit: 3
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
    projects: allFile(
      filter: {
        sourceInstanceName: { eq: "portfolio" }
        extension: { in: "md" }
      }
      sort: { fields: childMarkdownRemark___frontmatter___date, order: DESC }
      limit: 2
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
