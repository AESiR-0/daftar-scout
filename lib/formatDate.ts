const formatDate = (date: string) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
    
    const formattedTime = new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
    })

    return formattedDate + '. ' + formattedTime
}

export default formatDate;
