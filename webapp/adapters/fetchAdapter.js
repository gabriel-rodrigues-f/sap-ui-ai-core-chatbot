sap.ui.define([], function () {

    "use strict"

    return {
        adaptRequest: async function ({
            oBody,
            sPath,
            sMethod,
            oHeaders = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }) {
            try {
                // let responseBody
                // const response = await fetch(sPath, {
                //     method: sMethod,
                //     headers: oHeaders,
                //     body: oBody ? JSON.stringify(oBody) : null
                // })
                // responseBody = await response.text()
                // responseBody = responseBody ? JSON.parse(responseBody) : {}
                // const httpResponse = { oBody: responseBody }
                // return httpResponse
                return await Promise.resolve({
                    body: {
                        firstname: "First",
                        lastname: "Last",
                        email: "mail@mail.com"
                    }
                })
            } catch (error) {
                return {
                    error: error.message || "Erro inesperado"
                }
            }
        }
    }
})