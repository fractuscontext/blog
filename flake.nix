{
  description = "Hugo development and build environment for GitHub Pages";

  inputs = {
    nixpkgs.url = "git+https://github.com/nixos/nixpkgs?shallow=1&ref=nixpkgs-unstable";
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      git-hooks,
    }:
    let
      allSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs allSystems;
    in
    {
      checks = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          pre-commit-check = git-hooks.lib.${system}.run {
            src = ./.;
            hooks = {
              nixfmt = {
                enable = true;
              };

              rumdl = {
                enable = true;
                name = "Markdown Lint Check (rumdl)";
                entry = "${pkgs.rumdl}/bin/rumdl check";
                types = [ "markdown" ];
                pass_filenames = false;
              };

              reuse = {
                enable = true;
                name = "SPDX License Check";
                entry = "${pkgs.reuse}/bin/reuse lint";
                pass_filenames = false;
              };
            };
          };
        }
      );

      devShells = forAllSystems (
        system:
        let
          siteDir = "$(pwd)/";
          pkgs = nixpkgs.legacyPackages.${system};

          # Local dev server script
          run-local-server = pkgs.writeShellScriptBin "run-local-server" ''
            hugo server -DF --noHTTPCache -s "${siteDir}" --disableFastRender
          '';

          # Build script for GitHub Actions
          build-github-pages = pkgs.writeShellScriptBin "build-github-pages" ''
            hugo -F --gc --minify -s "${siteDir}" -d "${siteDir}/output" "$@"
          '';
        in
        {
          default = pkgs.mkShell {
            # Make hugo and our custom scripts available in the shell
            packages = with pkgs; [
              go
              reuse
              hugo
              rumdl
              run-local-server
              build-github-pages
            ];

            # Path hijacking and symlink creation
            shellHook = ''
              ${self.checks.${system}.pre-commit-check.shellHook}
              echo "Setting up Hugo theme symlink..."
              echo "Nix shell ready! Use 'run-local-server' to test locally."
            '';
          };
        }
      );
    };
}
