# 1. Use the official Node.js image as the base
FROM node:20-bookworm

# 2. Install Python, pip, and virtual environment tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# 3. Set the working directory inside the server
WORKDIR /app

# 4. Create a Python virtual environment and add it to the system PATH
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 5. Copy your Node package files and install JS dependencies
COPY package*.json ./
RUN npm install

# 6. Copy all your project files (including the /ml folder and models)
COPY . .

# 7. Install your Python ML dependencies
RUN pip install -r requirements.txt

# 8. Start your Node.js application 
# (Check your package.json. If you normally run 'node server.js', leave this as is)
CMD ["node", "server.js"]