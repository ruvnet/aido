#!/bin/bash

echo "Starting test and fix loop..."

# Store the original directory
original_dir=$(pwd)

# Counter for loop iterations
iteration=0
max_iterations=10

while [ $iteration -lt $max_iterations ]; do
  echo "Iteration $((iteration+1)) of $max_iterations"
  echo "Running test command: cd src && npm test AgentNetwork -- --run --no-watch"
  
  # Change to src directory, run the test, then change back
  (cd src && npm test AgentNetwork -- --run --no-watch)
  test_exit_code=$?
  
  # Ensure we're back in the original directory
  cd "$original_dir"
  
  if [ $test_exit_code -eq 0 ]; then
    echo "Test passed successfully!"
    exit 0
  else
    echo "Test failed. Attempting to fix..."
    
    # Capture the error output
    error_output=$(cd src && npm test AgentNetwork -- --run --no-watch 2>&1)
    
    # Prepare a more detailed message for Aider
    aider_message="The test 'npm test AgentNetwork' in the src directory failed. Here's the error output:

$error_output

Please analyze the error and suggest specific fixes for the following files:
1. src/components/AgentNetwork/AgentNetwork.test.tsx
2. src/components/AgentNetwork/AgentNetwork.tsx

Focus on these potential issues:
1. Asynchronous operations not properly handled in tests
2. Incorrect mocking of dependencies
3. Improper error handling in the component
4. Incorrect use of React testing library methods

Provide specific code changes to fix the failing tests."

    # Run Aider with the detailed message
    aider --message "$aider_message" --yes-always src/components/AgentNetwork/AgentNetwork.test.tsx src/components/AgentNetwork/AgentNetwork.tsx
    
    echo "Aider execution completed. Retrying test..."
  fi
  
  ((iteration++))
done

echo "Maximum iterations reached. Please review the changes and errors manually."#!/bin/bash

# Run tests and store output
npm test

# Check if tests failed
if [ $? -ne 0 ]; then
    echo "Tests failed. Would you like to see detailed test output? (y/n)"
    read answer
    if [ "$answer" = "y" ]; then
        npm test -- --verbose
    fi
fi
