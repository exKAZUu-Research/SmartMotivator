script_dir=$(cd $(dirname ${BASH_SOURCE:-$0}); pwd)
cd $script_dir/../client

# function to extract version
function find_version {
  version=$(grep '"version":' $1 | cut -d\" -f4)
  echo $version
}

# find version of actual branch
PACKAGE_VERSION_ACTUAL=$(grep '"version":' package.json | cut -d\" -f4)

# checkout & find version of release branch
MASTER_PACKAGE=$(git show remotes/origin/release:client/package.json)
PACKAGE_VERSION_RELEASE=$(echo "$MASTER_PACKAGE" | grep '"version":' | cut -d\" -f4)

# Comparison
if [ "$PACKAGE_VERSION_ACTUAL" == "$PACKAGE_VERSION_RELEASE" ]; then
  exit 1
fi
