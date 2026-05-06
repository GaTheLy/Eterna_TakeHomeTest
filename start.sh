#!/bin/bash

# Task & Schedule Manager - Quick Start Script
# This script starts all services using Docker Compose

set -e

echo "🚀 Starting Task & Schedule Manager..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose is not installed"
    echo "Please install Docker Compose and try again"
    exit 1
fi

echo "✅ Docker Compose is available"
echo ""

# Build and start services
echo "📦 Building and starting services..."
echo "This may take a few minutes on first run..."
echo ""

docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend:  http://localhost:3001"
echo "   Backend:   http://localhost:3000"
echo "   API Docs:  http://localhost:3000/api/docs"
echo ""
echo "👤 Sample Login Credentials:"
echo "   Email:     admin@example.com"
echo "   Password:  password123"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
