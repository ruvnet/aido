#!/bin/bash

echo "Starting test and fix loop..."

original_dir=$(pwd)
iteration=0
max_iterations=5

while [ $iteration -lt $max_iterations ]; do
  echo "Iteration $((iteration+1)) of $max_iterations"
  echo "Running test command: cd src && CI=true npm test AgentNetwork -- --run --reporter verbose"

  # Create a temporary file to store the test output
  test_output_file=$(mktemp)

  # Run the test, capture output and exit code, and display output in real-time
  (
    cd src
    CI=true npm test AgentNetwork -- --run --reporter verbose 2>&1
    echo $? > "$original_dir/exit_code.tmp"
  ) | tee "$test_output_file"

  # Read the exit code
  test_exit_code=$(cat exit_code.tmp)
  rm exit_code.tmp

  # Read the test output from the file
  test_output=$(cat "$test_output_file")
  rm "$test_output_file"

  # Ensure we're back in the original directory
  cd "$original_dir"

  if [ "$test_exit_code" -eq 0 ]; then
    echo "Test passed successfully!"
    exit 0
  else
    echo "Test failed. Attempting to fix..."

    # Extract specific error messages from the test output
    error_messages=$(echo "$test_output" | grep -E 'AssertionError|FAIL' -A 5)

    # Prepare a detailed message for Aider
    aider_message="The test 'npm test AgentNetwork' in the src directory failed with the following errors:

$error_messages

From the test output, two tests are failing:

1. **Test 'should handle empty proposal topic':**
   - **AssertionError:** expected '' to be 'Please enter a proposal topic'
   - The error message element exists but its text content is empty.

2. **Test 'should handle empty specialty selection':**
   - **AssertionError:** expected '' to be 'Please select an agent specialty'
   - Similarly, the error message element exists but has no text content.

It appears that the error messages are not being set or displayed correctly in the component when validation fails.

**Please analyze and suggest specific fixes for the following files:**

1. **src/components/AgentNetwork/AgentNetwork.tsx**
   - Ensure that the 'setError' function is called with the correct error message when validation fails.
   - Check that the error state is not being reset unintentionally after being set.
   - Verify that the error message is properly rendered in the JSX when an error exists.

2. **src/components/AgentNetwork/AgentNetwork.test.tsx**
   - Verify that the tests correctly simulate the validation failure conditions.
   - Ensure that the tests wait for the error message to appear if necessary, using async utilities like 'waitFor' or 'findBy'.

**Provide specific code changes to fix the failing tests and ensure that error messages are displayed correctly in both the component and the tests.**"

    # Run Aider with the detailed message
    aider --message "$aider_message" --yes-always \
      src/components/AgentNetwork/AgentNetwork.test.tsx \
      src/components/AgentNetwork/AgentNetwork.tsx

    echo "Aider execution completed. Retrying test..."
  fi

  ((iteration++))
done

echo "Maximum iterations reached. Please review the changes and errors manually."
