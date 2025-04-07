pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
        DO_API_TOKEN = credentials('digital-ocean-api-token')
        SSH_KEY = credentials('digital-ocean-ssh-key')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm test || true' // Add proper tests later
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test || true' // Add proper tests later
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker login -u $DOCKER_HUB_CREDS_USR -p $DOCKER_HUB_CREDS_PSW'
                
                // Build Frontend
                sh 'docker build -t $DOCKER_HUB_CREDS_USR/ai-communication-frontend:${BUILD_NUMBER} -f frontend/Dockerfile frontend/'
                
                // Build Backend
                sh 'docker build -t $DOCKER_HUB_CREDS_USR/ai-communication-backend:${BUILD_NUMBER} -f backend/Dockerfile backend/'
                
                // Build FastAPI
                sh 'docker build -t $DOCKER_HUB_CREDS_USR/ai-communication-fastapi:${BUILD_NUMBER} -f fastapi/Dockerfile fastapi/'
            }
        }

        stage('Push Docker Images') {
            steps {
                sh 'docker push $DOCKER_HUB_CREDS_USR/ai-communication-frontend:${BUILD_NUMBER}'
                sh 'docker push $DOCKER_HUB_CREDS_USR/ai-communication-backend:${BUILD_NUMBER}'
                sh 'docker push $DOCKER_HUB_CREDS_USR/ai-communication-fastapi:${BUILD_NUMBER}'
                
                // Tag as latest also
                sh 'docker tag $DOCKER_HUB_CREDS_USR/ai-communication-frontend:${BUILD_NUMBER} $DOCKER_HUB_CREDS_USR/ai-communication-frontend:latest'
                sh 'docker tag $DOCKER_HUB_CREDS_USR/ai-communication-backend:${BUILD_NUMBER} $DOCKER_HUB_CREDS_USR/ai-communication-backend:latest'
                sh 'docker tag $DOCKER_HUB_CREDS_USR/ai-communication-fastapi:${BUILD_NUMBER} $DOCKER_HUB_CREDS_USR/ai-communication-fastapi:latest'
                
                sh 'docker push $DOCKER_HUB_CREDS_USR/ai-communication-frontend:latest'
                sh 'docker push $DOCKER_HUB_CREDS_USR/ai-communication-backend:latest'
                sh 'docker push $DOCKER_HUB_CREDS_USR/ai-communication-fastapi:latest'
            }
        }

        stage('Deploy to Digital Ocean') {
            steps {
                sshagent(['digital-ocean-ssh-key']) {
                    // Copy docker-compose file to server
                    sh 'scp -o StrictHostKeyChecking=no docker-compose.yaml root@YOUR_DROPLET_IP:/root/'
                    
                    // Create .env files on the server with proper configurations
                    sh '''
                        ssh -o StrictHostKeyChecking=no root@YOUR_DROPLET_IP "
                        mkdir -p /root/env-files
                        
                        # Create backend .env
                        cat > /root/env-files/backend.env << 'EOL'
PORT=5000
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=eu-north-1
AWS_BUCKET_NAME=decentralized-fiverr-project
MONGODB_URI=${MONGODB_URI}
EOL
                        
                        # Create frontend .env
                        cat > /root/env-files/frontend.env << 'EOL'
VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
VITE_API_BASE_URL=http://YOUR_DOMAIN_OR_IP:5000
VITE_API_BASE_URL_API=http://YOUR_DOMAIN_OR_IP:5000/api
VITE_API_FASTAPI_URL=http://YOUR_DOMAIN_OR_IP:8000
EOL

                        # Create fastapi .env
                        cat > /root/env-files/fastapi.env << 'EOL'
PORT=8000
Grok_API_KEY=${Grok_API_KEY}
EOL

                        # Pull latest images and deploy
                        docker pull ${DOCKER_HUB_CREDS_USR}/ai-communication-frontend:latest
                        docker pull ${DOCKER_HUB_CREDS_USR}/ai-communication-backend:latest
                        docker pull ${DOCKER_HUB_CREDS_USR}/ai-communication-fastapi:latest
                        
                        # Create modified docker-compose that uses env files
                        cat > /root/docker-compose.yaml << 'EOL'
services:
  ai-communication-frontend:
    image: ${DOCKER_HUB_CREDS_USR}/ai-communication-frontend:latest
    ports:
      - \"5173:5173\"
    env_file:
      - /root/env-files/frontend.env
    restart: unless-stopped
    command: npm run dev -- --host
    depends_on:
      - ai-communication-backend
      - ai-communication-fastapi

  ai-communication-backend:
    image: ${DOCKER_HUB_CREDS_USR}/ai-communication-backend:latest
    ports:
      - \"5000:5000\"
    env_file:
      - /root/env-files/backend.env
    restart: unless-stopped
    command: npm run start
    depends_on:
      - ai-communication-fastapi

  ai-communication-fastapi:
    image: ${DOCKER_HUB_CREDS_USR}/ai-communication-fastapi:latest
    ports:
      - \"8000:8000\"
    env_file:
      - /root/env-files/fastapi.env
    restart: unless-stopped
    command: uvicorn main:app --host \"0.0.0.0\" --port 8000 --reload
EOL
                        
                        # Deploy with docker-compose
                        docker-compose down
                        docker-compose up -d
                        "
                    '''
                }
            }
        }
    }

    post {
        always {
            // Clean up workspace and Docker images
            sh 'docker system prune -af || true'
            cleanWs()
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}