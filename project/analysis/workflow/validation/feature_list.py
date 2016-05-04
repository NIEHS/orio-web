#!/usr/bin/env python
import sys
import os
import click
import subprocess

from .base import Validator


class FeatureListValidator(Validator):

    def __init__(self, feature_list, chrom_sizes_file):

        super().__init__()

        assert os.path.exists(feature_list)
        assert os.path.exists(chrom_sizes_file)

        self.feature_list = feature_list
        self.chrom_sizes_file = chrom_sizes_file

    def checkHeader(self, line):
        # Check to see if line is header
        if line == "\n":
            return True
        elif line[0] == "#":
            return True
        elif line.split()[0].lower() in ("track", "browser"):
            return True
        else:
            return False

    def get_executable(self):
        root = os.path.abspath(
            os.path.pardir(os.path.dirname(os.path.abspath(__file__)))
        )
        path = os.path.join(root, 'validateFiles')
        if not os.path.exists(path):
            raise IOError('validateFiles not found, expected {}'.format(path))
        return path

    def set_number_columns(self):
        # Find number of columns in bed
        with open(self.feature_list) as f:
            for line in f:
                if not (self.checkHeader(line)):
                    self.number_columns = len(line.split())
                    break

    def run_validate_file(self):
        executable = self.get_executable()
        proc = subprocess.Popen([
            executable,
            "-chromInfo=" + self.chrom_sizes_file,
            "-type=bed" + str(self.number_columns),
            self.feature_list
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, errors = proc.communicate()

        if output != 'Error count 0\n':
            outputs = output.splitlines()
            self.add_errors(outputs)

        if errors:
            errors = errors.splitlines()
            self.add_errors(errors)

    def check_unique_feature_names(self):
        # If BED file contains names (cols >= 4), make sure they are unique
        if self.number_columns < 4:
            return

        feature_names = set()
        with open(self.feature_list) as f:
            for line in f:
                if not (self.checkHeader(line)):
                    feature_name = line.strip().split()[3]
                    if feature_name in feature_names:
                        self.add_error(
                            'Duplicate feature name: {}'.format(feature_name))
                    else:
                        feature_names.add(feature_name)

    def validate(self):
        self.set_number_columns()
        self.run_validate_file()
        self.check_unique_feature_names()


@click.command()
@click.argument('feature_list')
@click.argument('chrom_sizes_file')
def cli(feature_list, chrom_sizes_file):
    """
    Validate feature_list file.
    """
    validator = FeatureListValidator(feature_list, chrom_sizes_file)
    validator.validate()
    sys.stdout.write(validator.display_errors())


if __name__ == '__main__':
    cli()
