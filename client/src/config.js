/* React environment configuration */
const prod = {
    env: 'production',
    api_host: '' 
};
const dev = {
    env: 'development',
    api_host: 'http://127.0.0.1:8000', 
};

export const config = process.env.NODE_ENV === 'development' ? dev : prod;