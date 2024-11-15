#!/bin/bash

# Function to display help message
function show_help {
  echo "Usage: $0 [OPTIONS] [test_name]"
  echo ""
  echo "Options:"
  echo "  --all       Fix all tests in components"
  echo "  --help      Display this help message"
  echo ""
  echo "Arguments:"
  echo "  test_name   Name of the specific test to fix (optional if --all is used)"
  echo ""
  echo "Examples:"
  echo "  $0 AgentNetwork     # Fix tests for AgentNetwork"
  echo "  $0 --all            # Fix all tests in components"
  exit 0
}

# Initialize variables
all_tests=false
test_name=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --all)
      all_tests=true
      shift # Remove --all from processing
      ;;
    --help)
      show_help
      ;;
    -*|--*) # Unknown option
      echo "Error: Unknown option $1"
      show_help
      ;;
    *) # Test name
      if [ -n "$test_name" ]; then
        echo "Error: Multiple test names provided. Please provide only one test name or use --all."
        show_help
      fi
      test_name="$1"
      shift # Remove test_name from processing
      ;;
  esac
done

if [ "$all_tests" = true ] && [ -n "$test_name" ]; then
  echo "Error: Cannot specify a test name and --all at the same time."
  exit 1
fi

if [ "$all_tests" = false ] && [ -z "$test_name" ]; then
  echo "Error: Please provide a test name or use --all."
  echo "Use --help for usage information."
  exit 1
fi

echo "Starting test and fix loop..."

original_dir=$(pwd)
max_iterations=5

if [ "$all_tests" = true ]; then
  # Get a list of all test names in src/components
  test_names=($(ls src/components))
else
  test_names=("$test_name")
fi

for test_name in "${test_names[@]}"; do
  # Check if the test files exist
  test_file="src/components/$test_name/$test_name.test.tsx"
  component_file="src/components/$test_name/$test_name.tsx"

  if [ ! -f "$test_file" ] || [ ! -f "$component_file" ]; then
    echo "Skipping $test_name: Test file or component file does not exist."
    continue
  fi

  iteration=0
  while [ $iteration -lt $max_iterations ]; do
    echo "Testing component: $test_name"
    echo "Iteration $((iteration+1)) of $max_iterations"
    echo "Running test command: cd src && CI=true npm test $test_name -- --run --reporter verbose"

    # Create a temporary file to store the test output
    test_output_file=$(mktemp)

    # Run the test, capture output and exit code, and display output in real-time
    (
      cd src
      CI=true npm test "$test_name" -- --run --reporter verbose 2>&1
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
      echo "Test passed successfully for component $test_name!"
      break
    else
      echo "Test failed for component $test_name. Attempting to fix..."

      # Extract specific error messages from the test output
      error_messages=$(echo "$test_output" | grep -E 'AssertionError|FAIL' -A 5)

      # Prepare a detailed message for Aider
      aider_message="The test 'npm test $test_name' in the src directory failed with the following errors:

$error_messages

From the test output, some tests are failing.

Please analyze and suggest specific fixes for the following files:

1. src/components/$test_name/$test_name.test.tsx
2. src/components/$test_name/$test_name.tsx

Focus on these potential issues:

- Asynchronous operations not properly handled in tests
- Incorrect mocking of dependencies
- Improper error handling in the component
- Incorrect use of React Testing Library methods

Provide specific code changes to fix the failing tests and ensure that error messages are displayed correctly in both the component and the tests."

      # Run Aider with the detailed message
      aider --message "$aider_message" --yes-always \
        "src/components/$test_name/$test_name.test.tsx" \
        "src/components/$test_name/$test_name.tsx"

      echo "Aider execution completed. Retrying test..."
    fi

    ((iteration++))
  done

  if [ $iteration -ge $max_iterations ]; then
    echo "Maximum iterations reached for component $test_name. Please review the changes and errors manually."
  fi

done

echo "Test and fix loop completed."
