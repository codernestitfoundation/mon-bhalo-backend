export const getTransactionId = () => {
    return `tran_id: ${Date.now()}${Math.floor(Math.random() * 1000)}`
}