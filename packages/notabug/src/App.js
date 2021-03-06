import React, { useEffect } from "react"
import Helmet from "react-helmet"
import { Config } from "@notabug/peer"
import qs from "query-string"
import { NabContext, useNabGlobals } from "/NabContext"
import { withRouter } from "react-router-dom"
import { Routing } from "/Routing"
import { PageTemplate } from "/Page/Template"
import { VotingQueue } from "/Voting"
import { UiStateProvider, useUi } from "/UserState"
import { ErrorBoundary } from "/utils"
export { routes } from "/Routing"

const configUpdates = {}

if (process.env.NAB_OWNER) configUpdates.owner = process.env.NAB_OWNER
if (process.env.NAB_TABULATOR)
  configUpdates.tabulator = process.env.NAB_TABULATOR
if (process.env.NAB_INDEXER) configUpdates.indexer = process.env.NAB_INDEXER

if (Object.keys(configUpdates).length) Config.update(configUpdates)

export const NabProvider = withRouter(
  ({ location: { search }, history, notabugApi, children }) => {
    const value = useNabGlobals({ notabugApi, history })
    const query = qs.parse(search)

    useEffect(() => {
      if (query.indexer) {
        console.log("update indexer", query.indexer)
        Config.update({ indexer: query.indexer, tabulator: query.indexer })
      }
    }, [query.indexer])

    if (value.isLoggingIn) {
      return (
        <PageTemplate>
          <h1>Logging In...</h1>
        </PageTemplate>
      )
    }

    return <NabContext.Provider value={value}>{children}</NabContext.Provider>
  }
)

export const AppBody = () => {
  const { isConfigLoaded, darkMode } = useUi()

  if (!isConfigLoaded) {
    return <h1>Loading settings...</h1>
  }

  return (
    <>
      <Helmet>
        <title>notabug: the back page of the internet</title>
        <html className={darkMode ? "darkmode" : ""} />
        <body className={`loggedin subscriber`} />
      </Helmet>

      <VotingQueue>
        <Routing />
      </VotingQueue>
    </>
  )
}

export const App = withRouter(
  React.memo(({ notabugApi, history }) => (
    <NabProvider {...{ notabugApi, history }}>
      <ErrorBoundary>
        <UiStateProvider>
          <AppBody />
        </UiStateProvider>
      </ErrorBoundary>
    </NabProvider>
  ))
)
