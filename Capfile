load 'deploy'

set :repository, "stojg.se:ants.git"
set :shared_children, %w()
set :deploy_to, "/var/www/play.stojg.se/"
set :deploy_via, :copy
set :user, 'deployer'
set :normalize_asset_timestamps, false
# Hostnames of your App Servers
server 'play.stojg.se', :app