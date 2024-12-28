{
  description = "bzzzzz";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";

    strawberry.url = "github:goffrie/strawberry";
  };

  outputs = { self, nixpkgs, flake-utils, strawberry, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        packages.client = import ./client { inherit pkgs; };
      }) // {
        nixosModules.default = args@{ pkgs, ... }:
          import ./service.nix {
            inherit (self.packages."${pkgs.stdenv.targetPlatform.system}") client;
            inherit (strawberry.packages."${pkgs.stdenv.targetPlatform.system}") server;
          } args;
      };
}
